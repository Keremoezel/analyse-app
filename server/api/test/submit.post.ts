import { db, schema } from '../../db'
import { eq, and, gt, desc } from 'drizzle-orm'
import { getAdjectiveMapping, DISG_QUESTIONS, type DisgType } from '../../utils/questions'

interface AnswerItem {
    word: string
    score: number // 1-4
}

interface SubmitBody {
    email: string
    answers: AnswerItem[]
    code: string // Verification code
}

export default defineEventHandler(async (event) => {
    const body = await readBody<SubmitBody>(event)

    // Validate email
    if (!body.email || !body.email.includes('@')) {
        throw createError({
            statusCode: 400,
            message: 'Ungültige E-Mail-Adresse',
        })
    }

    // 1. Verify code
    if (!body.code) {
        throw createError({
            statusCode: 400,
            message: 'Bestätigungscode ist erforderlich',
        })
    }

    const verification = await db.query.verifications.findFirst({
        where: and(
            eq(schema.verifications.email, body.email),
            eq(schema.verifications.code, body.code),
            gt(schema.verifications.expiresAt, new Date())
        ),
        orderBy: desc(schema.verifications.createdAt)
    })

    if (!verification) {
        throw createError({
            statusCode: 400,
            message: 'Ungültiger oder abgelaufener Bestätigungscode',
        })
    }

    // Delete the verification record so it can't be reused
    await db.delete(schema.verifications).where(eq(schema.verifications.id, verification.id))

    // Validate answers
    if (!body.answers || body.answers.length !== 40) {
        throw createError({
            statusCode: 400,
            message: 'Es müssen genau 40 Antworten vorhanden sein',
        })
    }

    // Calculate DISG scores
    const mapping = getAdjectiveMapping()
    const scores: Record<DisgType, number> = { D: 0, I: 0, S: 0, G: 0 }

    for (const answer of body.answers) {
        const type = mapping[answer.word]
        if (!type) {
            throw createError({
                statusCode: 400,
                message: `Unbekanntes Adjektiv: ${answer.word}`,
            })
        }
        if (answer.score < 1 || answer.score > 4) {
            throw createError({
                statusCode: 400,
                message: `Ungültige Punktzahl für ${answer.word}: ${answer.score}`,
            })
        }
        scores[type] += answer.score
    }

    // Validate checksum = 100
    const total = scores.D + scores.I + scores.S + scores.G
    if (total !== 100) {
        throw createError({
            statusCode: 400,
            message: `Gesamtpunktzahl muss 100 sein, ist aber ${total}`,
        })
    }

    // Validate each row has unique scores 1-4
    for (const row of DISG_QUESTIONS) {
        const rowScores = row.adjectives.map(adj => {
            const answer = body.answers.find(a => a.word === adj.word)
            return answer?.score
        })
        const uniqueScores = new Set(rowScores)
        if (uniqueScores.size !== 4 || ![1, 2, 3, 4].every(s => uniqueScores.has(s))) {
            throw createError({
                statusCode: 400,
                message: `Zeile ${row.id}: Jede Punktzahl (1-4) muss genau einmal vergeben werden`,
            })
        }
    }

    // Find or create user
    let user = await db.query.users.findFirst({
        where: eq(schema.users.email, body.email),
    })

    if (!user) {
        const inserted = await db.insert(schema.users).values({
            email: body.email,
        }).returning()
        user = inserted[0]
    }

    // Save result
    const slug = crypto.randomUUID()
    const result = await db.insert(schema.results).values({
        userId: user!.id,
        dScore: scores.D,
        iScore: scores.I,
        sScore: scores.S,
        gScore: scores.G,
        rawData: body.answers,
        slug: slug,
    }).returning()

    // Send results email and await completion (required for Vercel Serverless)
    try {
        await $fetch('/api/email/send-results', {
            method: 'POST',
            body: {
                resultId: slug,
                email: body.email,
            },
        })
    } catch (error) {
        console.error('Failed to send results email:', error)
    }

    return {
        success: true,
        resultId: slug, // Return SLUG instead of ID
        scores,
    }
})
