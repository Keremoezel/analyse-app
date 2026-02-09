import { db, schema } from '../../db'
import crypto from 'node:crypto'

interface LoginBody {
    email?: string
    password?: string
}

export default defineEventHandler(async (event) => {
    const body = await readBody<LoginBody>(event)
    const email = body.email?.toLowerCase().trim()
    const password = body.password?.trim()

    if (!email || !password) {
        throw createError({ statusCode: 400, message: 'E-Mail und Passwort sind erforderlich' })
    }

    const config = useRuntimeConfig()

    // 1. Whitelist Check (Email must be allowed)
    const envAllowed = (config.allowedEmails || '').split(',').map((e: string) => e.trim())

    const allowedEmails = [
        ...envAllowed,
        config.emailAdminRecipient
    ].filter(Boolean).map(e => e.toLowerCase())

    if (!allowedEmails.includes(email)) {
        // Uniform response time/error
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500))
        throw createError({ statusCode: 401, message: 'Ungültige Anmeldedaten' })
    }

    // 2. Password Check (Shared Admin Password)
    if (password !== config.adminPassword) {
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500))
        throw createError({ statusCode: 401, message: 'Ungültige Anmeldedaten' })
    }

    // Generate Session Token
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 std

    await db.insert(schema.adminSessions).values({
        token,
        userEmail: email, // Store the actual user email for logging
        expiresAt
    })

    // Set Cookie
    setCookie(event, 'admin_token', token, {
        httpOnly: false, // Must be false so client-side middleware can read it (simpler than separate API check)
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 2 // 2 std
    })

    return { success: true }
})
