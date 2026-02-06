import { db, schema } from '../../../db'
import { eq } from 'drizzle-orm'
import { typeDescriptions, generateResultEmailHTML } from '../../../utils/email-template'
import { generatePdf } from '../../../utils/pdf-generator'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')

    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'Ungültige Ergebnis-ID',
        })
    }

    // Get result from database
    const result = await db.query.results.findFirst({
        where: eq(schema.results.slug, id),
    })

    if (!result) {
        throw createError({
            statusCode: 404,
            message: 'Ergebnis nicht gefunden',
        })
    }

    // Get user email
    const user = await db.query.users.findFirst({
        where: eq(schema.users.id, result.userId),
    })
    const name = user?.email?.split('@')[0] || 'Teilnehmer'

    const scores = {
        D: result.dScore,
        I: result.iScore,
        S: result.sScore,
        G: result.gScore,
    }

    // Determine Dominant Type
    const maxScore = Math.max(scores.D, scores.I, scores.S, scores.G)
    let dominantType: keyof typeof typeDescriptions = 'D'
    if (scores.D === maxScore) dominantType = 'D'
    else if (scores.I === maxScore) dominantType = 'I'
    else if (scores.S === maxScore) dominantType = 'S'
    else dominantType = 'G'

    // Determine Secondary Type
    const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1])
    const secondaryTypeKey = sortedScores[1]?.[0] as keyof typeof typeDescriptions | undefined
    const secondaryType = secondaryTypeKey ? typeDescriptions[secondaryTypeKey] : null

    const currentType = typeDescriptions[dominantType]
    const origin = getRequestURL(event).origin

    // Generate PDF HTML using the Email Template
    const pdfHtml = generateResultEmailHTML({
        typeData: currentType,
        scores: scores,
        dominantType: dominantType,
        secondaryType: secondaryType,
        origin: origin,
        resultUrl: `${origin}/result/${id}`
    })

    // Generate PDF Buffer
    const pdfBuffer = await generatePdf(pdfHtml)

    // Set headers for PDF view
    setResponseHeader(event, 'Content-Type', 'application/pdf')
    setResponseHeader(event, 'Content-Disposition', `inline; filename="DISG-Analyse-${name}.pdf"`)

    return pdfBuffer
})
