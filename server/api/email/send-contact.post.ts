import { Resend } from 'resend'

interface SendContactEmailBody {
    name: string
    email: string
    phone?: string
    availability?: string
    message: string
    sendCopy?: boolean
}

export default defineEventHandler(async (event) => {
    const body = await readBody<SendContactEmailBody>(event)

    // Validate input
    if (!body.name || !body.email || !body.message) {
        throw createError({
            statusCode: 400,
            message: 'Name, email, and message are required',
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
            message: body.message,
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
                    subject: 'Bestätigung Ihrer Kontaktanfrage - Power4-people',
                    html: `
                        <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
                            <h2>Vielen Dank für Ihre Anfrage!</h2>
                            <p>Hallo ${body.name},</p>
                            <p>wir haben Ihre Nachricht erhalten und werden uns in Kürze bei Ihnen melden.</p>
                            <p>Im Anhang finden Sie eine Kopie Ihrer Anfrage als PDF-Dokument.</p>
                            <br>
                            <p>Mit freundlichen Grüßen,</p>
                            <p><strong>Power4-people Team</strong></p>
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
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #28a745 0%, #20963d 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">📬 Neue Kontaktanfrage</h1>
    </div>
    
    <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #1a1a2e; border-bottom: 2px solid #28a745; padding-bottom: 10px;">Kontaktdaten</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px 0; font-weight: bold; width: 120px;">Name:</td>
                    <td style="padding: 8px 0;">${data.contactData.name}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; font-weight: bold;">E-Mail:</td>
                    <td style="padding: 8px 0;"><a href="mailto:${data.contactData.email}" style="color: #4a90d9;">${data.contactData.email}</a></td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Telefon:</td>
                    <td style="padding: 8px 0;">${data.contactData.phone}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Erreichbarkeit:</td>
                    <td style="padding: 8px 0;">${data.contactData.availability}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Datum:</td>
                    <td style="padding: 8px 0;">${data.contactData.timestamp}</td>
                </tr>
            </table>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px;">
            <h3 style="margin-top: 0; color: #1a1a2e; border-bottom: 2px solid #28a745; padding-bottom: 10px;">Nachricht</h3>
            <p style="white-space: pre-wrap; margin: 0;">${data.contactData.message}</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
            <a href="mailto:${data.replyTo}" style="display: inline-block; background: linear-gradient(135deg, #4a90d9 0%, #357abd 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: bold;">Antworten</a>
        </div>
        
        <p style="font-size: 12px; color: #999; text-align: center; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
            Diese E-Mail wurde automatisch von Ihrem DISG Persönlichkeitstest Kontaktformular generiert.
        </p>
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
        <p>Power4-people Kurzanalyse</p>
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
        © ${new Date().getFullYear()} Power4-people Team | DISG Persönlichkeitsanalyse
    </div>
</body>
</html>
    `.trim()
}
