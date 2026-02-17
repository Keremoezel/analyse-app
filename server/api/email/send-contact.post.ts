import { Resend } from 'resend'
import { db, schema } from '../../db'
import { eq } from 'drizzle-orm'
import { getEmailSignatureHTML } from '../../utils/email-signature'

interface SendContactEmailBody {
    name: string
    email: string
    phone?: string
    availability?: string
    message: string
    sendCopy?: boolean
    resultId?: number // For tracking analytics
    hasVoucher?: boolean
    voucherCode?: string
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
            hasVoucher: body.hasVoucher || false,
            voucherCode: body.voucherCode
        }

        const adminEmailData = {
            to: config.emailAdminRecipient || 'admin@yourdomain.com',
            from: config.emailFromSupport || 'support@yourdomain.com',
            replyTo: body.email, // Allow admin to reply directly to user
            subject: body.hasVoucher ? `🎫 GUTSCHEIN (${body.voucherCode}) - Neue Kontaktanfrage von ${body.name}` : `Neue Kontaktanfrage von ${body.name}`,
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
                            ${getEmailSignatureHTML()}
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
    <meta name="color-scheme" content="light only">
    <meta name="supported-color-schemes" content="light">
    <title>Neue Kontaktanfrage</title>
    <style>
        /* Prevent dark mode */
        :root {
            color-scheme: light only;
            supported-color-schemes: light;
        }
        body, div, p, span, a, table, td, th {
            color-scheme: light only !important;
        }
    </style>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #000000; background-color: #ffffff; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #dddddd;">

        <!-- Header -->
        <div style="background-color: #667eea; padding: 30px; text-align: center; color: #ffffff;">
            ${data.contactData.hasVoucher ? `<div style="background-color: #ffd700; color: #000; display: inline-block; padding: 5px 15px; border-radius: 20px; font-weight: bold; margin-bottom: 10px;">🎫 GUTSCHEIN: ${data.contactData.voucherCode}</div>` : ''}
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">📬 Neue Kontaktanfrage</h1>
            <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px;">${data.contactData.timestamp}</p>
        </div>

        <!-- Content -->
        <div style="padding: 30px; background-color: #ffffff;">

            <!-- Contact Info -->
            <div style="background-color: #f5f5f5; padding: 20px; margin-bottom: 20px; border-left: 4px solid #667eea;">
                <h2 style="color: #000000; margin: 0 0 15px 0; font-size: 18px;">Kontaktinformationen</h2>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 0; color: #000000; font-weight: bold; width: 120px;">Name:</td>
                        <td style="padding: 8px 0; color: #000000;">${data.contactData.name}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #000000; font-weight: bold; border-top: 1px solid #dddddd;">E-Mail:</td>
                        <td style="padding: 8px 0; border-top: 1px solid #dddddd;">
                            <a href="mailto:${data.contactData.email}" style="color: #667eea; text-decoration: underline;">${data.contactData.email}</a>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #000000; font-weight: bold; border-top: 1px solid #dddddd;">Telefon:</td>
                        <td style="padding: 8px 0; color: #000000; border-top: 1px solid #dddddd;">
                            ${data.contactData.phone !== 'Nicht angegeben' ? `<a href="tel:${data.contactData.phone}" style="color: #000000; text-decoration: underline;">${data.contactData.phone}</a>` : data.contactData.phone}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #000000; font-weight: bold; border-top: 1px solid #dddddd;">Erreichbar:</td>
                        <td style="padding: 8px 0; color: #000000; border-top: 1px solid #dddddd;">${data.contactData.availability}</td>
                    </tr>
                </table>
            </div>

            <!-- Message -->
            <div style="margin-bottom: 25px;">
                <h3 style="color: #000000; margin: 0 0 10px 0; font-size: 16px;">Nachricht:</h3>
                <div style="color: #000000; white-space: pre-wrap; line-height: 1.6; padding: 15px; background-color: #f5f5f5; border-left: 4px solid #667eea;">${data.contactData.message}</div>
            </div>

            <!-- Reply Button -->
            <div style="text-align: center; padding: 20px; background-color: #f9f9f9; border: 2px solid #667eea;">
                <a href="mailto:${data.contactData.email}?subject=Re:%20Ihre%20Anfrage%20bei%20power4-people&body=Hallo%20${encodeURIComponent(data.contactData.name)}%2C%0A%0A"
                   style="display: inline-block; background-color: #667eea; color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">
                    JETZT ANTWORTEN
                </a>
            </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f5f5f5; padding: 20px; border-top: 1px solid #dddddd;">
            ${getEmailSignatureHTML()}
            <p style="font-size: 12px; color: #666666; margin: 15px 0 0 0; text-align: center;">
                © ${new Date().getFullYear()} power4-people Kurzanalyse
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

            ${data.hasVoucher ? `
            <tr>
                <td class="label">Gutschein:</td>
                <td style="color: #28a745; font-weight: bold;">Ja, Code: ${data.voucherCode}</td>
            </tr>
            ` : ''}
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
