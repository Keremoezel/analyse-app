import { db, schema } from '../../db'
import { eq } from 'drizzle-orm'
import { Resend } from 'resend'
import { typeDescriptions, generateResultEmailHTML } from '../../utils/email-template'
import { generatePdf } from '../../utils/pdf-generator'
import { getEmailSignatureHTML } from '../../utils/email-signature'

interface SendResultsEmailBody {
    resultId: string // UUID slug
    email: string
    name: string
}

export default defineEventHandler(async (event) => {
    const body = await readBody<SendResultsEmailBody>(event)

    // Validate input
    if (!body.resultId || !body.email) {
        throw createError({
            statusCode: 400,
            message: 'resultId and email are required',
        })
    }

    if (!body.email.includes('@')) {
        throw createError({
            statusCode: 400,
            message: 'Invalid email address',
        })
    }

    try {
        // Fetch result from database
        const result = await db.query.results.findFirst({
            where: eq(schema.results.slug, body.resultId),
        })

        if (!result) {
            throw createError({
                statusCode: 404,
                message: 'Result not found',
            })
        }

        // Get user for name
        const user = await db.query.users.findFirst({
            where: eq(schema.users.id, result.userId),
        })

        const name = body.name || 'Teilnehmer'

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

        // 1. Generate PDF HTML using the Email Template
        const pdfHtml = generateResultEmailHTML({
            typeData: currentType,
            scores: scores,
            dominantType: dominantType,
            secondaryType: secondaryType,
            origin: origin,
            resultUrl: `${origin}/result/${body.resultId}`
        })

        // 2. Generate PDF Buffer
        const pdfBuffer = await generatePdf(pdfHtml)

        // 3. Send Email with Attachment
        const resend = new Resend(useRuntimeConfig().emailApiKey)
        const emailTo = body.email
        const emailFrom = useRuntimeConfig().emailFromSupport || 'support@yourdomain.com'

        // Simple HTML Body
        const htmlBody = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
</head>
<body style="font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px;">
    <p>Hallo ${name},</p>
    
    <p>vielen Dank für Ihre Teilnahme am power4-people Kurzanalyse.</p>
    
    <p><strong>Anbei erhalten Sie Ihre detaillierte Auswertung als PDF-Dokument.</strong></p>
    
    <p>
        Wir wünschen Ihnen spannende Erkenntnisse beim Lesen!<br>
        Bei Fragen stehen wir Ihnen gerne zur Verfügung.
    </p>

    <p style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-left: 4px solid #667eea; border-radius: 4px;">
        📧 <strong>Kontakt:</strong> <a href="mailto:kurzanalyse@power4-people.de" style="color: #667eea; text-decoration: none; font-weight: 500;">kurzanalyse@power4-people.de</a>
    </p>

    <div style="margin-top: 25px; text-align: center;">
        <p style="font-size: 15px; color: #333; margin-bottom: 12px;">
            <strong>Möchten Sie mehr über die detaillierte Analyse erfahren?</strong>
        </p>
        <a href="https://outlook.office.com/bookwithme/user/0b454bd6639f491aba5ec10b9ccd324f%40power4-group.de?anonymous&ismsaljsauthenabled" 
           style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea, #5a6fd6); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 600; letter-spacing: 0.3px;">
            📅 Jetzt Termin vereinbaren
        </a>
    </div>

    ${getEmailSignatureHTML()}
</body>
</html>
        `.trim()

        await resend.emails.send({
            from: emailFrom,
            to: emailTo,
            subject: 'Ihre power4-people Kurzanalyse (PDF)',
            html: htmlBody,
            attachments: [
                {
                    filename: `power4-people-Kurzanalyse-${name}.pdf`,
                    content: pdfBuffer,
                },
            ],
        })

        console.log('✅ Results email with PDF sent successfully to:', emailTo)

        return {
            success: true,
            message: 'Email sent successfully with PDF',
        }

    } catch (error: any) {
        console.error('Error sending results email:', error)
        throw createError({
            statusCode: 500,
            message: error.message || 'Failed to send email',
        })
    }
})
