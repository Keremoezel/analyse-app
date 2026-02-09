import { Resend } from 'resend'
import { db, schema } from '../../db'
import { eq } from 'drizzle-orm'

interface SendContactEmailBody {
    name: string
    email: string
    phone?: string
    availability?: string
    message: string
    sendCopy?: boolean
    resultId?: number // For tracking analytics
}

export default defineEventHandler(async (event) => {
    const body = await readBody<SendContactEmailBody>(event)

    // Validate input
    if (!body.name || !body.email) {
        throw createError({
            statusCode: 400,
            message: 'Name and email are required',
        })
    }

    if (!body.email.includes('@')) {
        throw createError({
            statusCode: 400,
            message: 'Invalid email address',
        })
    }

    const config = useRuntimeConfig()

    try {
        // Prepare email data for admin
        const contactData = {
            name: body.name,
            email: body.email,
            phone: body.phone || 'Nicht angegeben',
            availability: body.availability || 'Nicht angegeben',
            message: body.message || 'Keine Nachricht',
            timestamp: new Date().toLocaleString('de-DE'),
        }

        const adminEmailData = {
            to: config.emailAdminRecipient || 'admin@yourdomain.com',
            from: config.emailFromSupport || 'support@yourdomain.com',
            replyTo: body.email, // Allow admin to reply directly to user
            subject: `Neue Kontaktanfrage von ${body.name}`,
            contactData: contactData,
        }

        // Initialize Resend
        const resend = new Resend(config.emailApiKey)

        // Send email to admin
        await resend.emails.send({
            from: adminEmailData.from,
            to: adminEmailData.to,
            replyTo: adminEmailData.replyTo,
            subject: adminEmailData.subject,
            html: generateContactEmailHTML(adminEmailData),
        })

        // Optional: Send confirmation to user if requested
        if (body.sendCopy) {
            try {
                const { generatePdf } = await import('../../utils/pdf-generator')
                const contactPdfHtml = generateContactPdfHTML(contactData)
                const pdfBuffer = await generatePdf(contactPdfHtml)

                await resend.emails.send({
                    from: adminEmailData.from,
                    to: body.email,
                    subject: 'Bestätigung Ihrer Kontaktanfrage - power4-people',
                    html: `
                        <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
                            <h2>Vielen Dank für Ihre Anfrage!</h2>
                            <p>Hallo ${body.name},</p>
                            <p>wir haben Ihre Nachricht erhalten und werden uns in Kürze bei Ihnen melden.</p>
                            <p>Im Anhang finden Sie eine Kopie Ihrer Anfrage als PDF-Dokument.</p>
                            <br>
                            <p>Mit freundlichen Grüßen,</p>
                            <p><strong>power4-people Team</strong></p>
                        </div>
                    `,
                    attachments: [
                        {
                            filename: `Kontaktanfrage-${body.name.replace(/\s+/g, '_')}.pdf`,
                            content: pdfBuffer,
                        }
                    ]
                })
            } catch (confirmError) {
                console.error('Failed to send confirmation email to user:', confirmError)
                // Continue even if confirmation fails
            }
        }

        // Track analytics: Mark result as contacted
        if (body.resultId) {
            try {
                await db.update(schema.results)
                    .set({ contactedAt: new Date() })
                    .where(eq(schema.results.id, body.resultId))
            } catch (dbError) {
                console.error('Failed to update result analytics:', dbError)
                // Non-critical, continue
            }
        }

        console.log('✅ Contact form email sent successfully')

        return {
            success: true,
            message: 'Your message has been sent successfully',
        }

    } catch (error: any) {
        console.error('Error sending contact form email:', error)
        throw createError({
            statusCode: 500,
            message: error.message || 'Failed to send email',
        })
    }
})

// Helper function to generate admin notification email HTML
function generateContactEmailHTML(data: any) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Neue Kontaktanfrage</title>
</head>
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f5f7fa; margin: 0; padding: 40px 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); overflow: hidden;">
        
        <!-- Header -->
        <div style="background: white; padding: 30px 40px; border-bottom: 1px solid #edf2f7; text-align: center;">
            <h1 style="color: #1a1a2e; margin: 0; font-size: 24px; font-weight: 700;">Neue Kontaktanfrage</h1>
            <p style="color: #718096; margin: 10px 0 0 0; font-size: 14px;">Eingegangen am ${data.contactData.timestamp}</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px;">
            <!-- Key Details -->
            <div style="background: #f8fafc; border-radius: 8px; padding: 25px; margin-bottom: 30px; border: 1px solid #e2e8f0;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 10px 0; font-weight: 600; color: #718096; width: 140px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Name</td>
                        <td style="padding: 10px 0; font-weight: 500; color: #1a1a2e; font-size: 16px;">${data.contactData.name}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0; font-weight: 600; color: #718096; width: 140px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; border-top: 1px solid #e2e8f0;">E-Mail</td>
                        <td style="padding: 10px 0; font-weight: 500; font-size: 16px; border-top: 1px solid #e2e8f0;">
                            <a href="mailto:${data.contactData.email}" style="color: #4a90d9; text-decoration: none;">${data.contactData.email}</a>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0; font-weight: 600; color: #718096; width: 140px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; border-top: 1px solid #e2e8f0;">Telefon</td>
                        <td style="padding: 10px 0; font-weight: 500; color: #1a1a2e; font-size: 16px; border-top: 1px solid #e2e8f0;">${data.contactData.phone}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0; font-weight: 600; color: #718096; width: 140px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; border-top: 1px solid #e2e8f0;">Erreichbarkeit</td>
                        <td style="padding: 10px 0; font-weight: 500; color: #1a1a2e; font-size: 16px; border-top: 1px solid #e2e8f0;">${data.contactData.availability}</td>
                    </tr>
                </table>
            </div>

            <!-- Message -->
            <div>
                <h3 style="margin-top: 0; color: #2d3748; font-size: 18px; font-weight: 600; margin-bottom: 15px;">Nachricht</h3>
                <div style="color: #4a5568; white-space: pre-wrap; line-height: 1.7; font-size: 15px;">${data.contactData.message}</div>
            </div>

            <!-- Action Button -->
            <div style="text-align: center; margin-top: 40px;">
                <a href="mailto:${data.replyTo}" style="display: inline-block; background-color: #4a90d9; color: white; padding: 14px 35px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(74, 144, 217, 0.25); transition: background-color 0.2s;">
                    Antworten
                </a>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #edf2f7;">
            <p style="font-size: 13px; color: #a0aec0; margin: 0; font-weight: 500;">
                power4-people Kurzanalyse
            </p>
        </div>
    </div>
</body>
</html>
    `.trim()
}

// Helper function to generate PDF HTML for contact submission
function generateContactPdfHTML(data: any) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'Arial', sans-serif; color: #333; line-height: 1.6; padding: 40px; }
        .header { border-bottom: 2px solid #4a90d9; padding-bottom: 20px; margin-bottom: 30px; }
        h1 { color: #1a1a2e; margin: 0; font-size: 24px; }
        .section { margin-bottom: 25px; }
        .section-title { font-weight: bold; color: #4a90d9; font-size: 18px; margin-bottom: 10px; border-bottom: 1px solid #eee; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 8px 0; vertical-align: top; }
        .label { font-weight: bold; width: 150px; }
        .message-box { background: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #eee; white-space: pre-wrap; }
        .footer { margin-top: 50px; font-size: 12px; color: #999; text-align: center; border-top: 1px solid #eee; padding-top: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Kopie Ihrer Kontaktanfrage</h1>
        <p>power4-people Kurzanalyse</p>
    </div>

    <div class="section">
        <div class="section-title">Kontaktdaten</div>
        <table>
            <tr>
                <td class="label">Name:</td>
                <td>${data.name}</td>
            </tr>
            <tr>
                <td class="label">E-Mail:</td>
                <td>${data.email}</td>
            </tr>
            <tr>
                <td class="label">Telefon:</td>
                <td>${data.phone}</td>
            </tr>
            <tr>
                <td class="label">Erreichbarkeit:</td>
                <td>${data.availability}</td>
            </tr>
            <tr>
                <td class="label">Datum:</td>
                <td>${data.timestamp}</td>
            </tr>
        </table>
    </div>

    <div class="section">
        <div class="section-title">Ihre Nachricht</div>
        <div class="message-box">${data.message}</div>
    </div>

    <div class="footer">
        © ${new Date().getFullYear()} power4-people Team - Kurzanalyse
    </div>
</body>
</html>
    `.trim()
}
