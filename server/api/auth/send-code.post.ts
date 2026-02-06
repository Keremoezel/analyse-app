import { db, schema } from '../../db'
import { Resend } from 'resend'

interface SendCodeBody {
    email: string
}

export default defineEventHandler(async (event) => {
    const body = await readBody<SendCodeBody>(event)

    if (!body.email || !body.email.includes('@')) {
        throw createError({
            statusCode: 400,
            message: 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
        })
    }

    // 1. Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    // 2. Set expiration (5 minutes from now)
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 5)

    try {
        // 3. Save to database
        await db.insert(schema.verifications).values({
            email: body.email,
            code: code,
            expiresAt: expiresAt,
        })

        // 4. Send email
        const config = useRuntimeConfig()
        const resend = new Resend(config.emailApiKey)

        await resend.emails.send({
            from: config.emailFromNoreply || 'noreply@yourdomain.com',
            to: body.email,
            subject: 'Ihr Bestätigungscode für die DISG-Analyse',
            html: `
                <div style="font-family: sans-serif; line-height: 1.5; color: #333; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
                    <h2 style="color: #4a90d9; text-align: center;">E-Mail Bestätigung</h2>
                    <p>Vielen Dank für Ihre Teilnahme an der DISG-Analyse.</p>
                    <p>Ihr Bestätigungscode lautet:</p>
                    <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1a1a2e; border-radius: 8px; margin: 20px 0;">
                        ${code}
                    </div>
                    <p style="font-size: 14px; color: #666;">Dieser Code ist <strong>5 Minuten</strong> gültig.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #999; text-align: center;">
                        Falls Sie diese Anfrage nicht gestellt haben, können Sie diese E-Mail einfach ignorieren.
                    </p>
                </div>
            `,
        })

        return { success: true }
    } catch (error: any) {
        console.error('Error in send-code:', error)
        throw createError({
            statusCode: 500,
            message: 'Fehler beim Senden des Bestätigungscodes',
        })
    }
})
