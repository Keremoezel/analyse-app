import { db, schema } from '../db'
import { eq, and, gt } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
    // Only protect /api/admin routes
    if (!event.path.startsWith('/api/admin')) {
        return
    }

    // Allow login/verify endpoints explicitly (even though they are in /api/auth, just to be safe if moved)
    if (event.path.startsWith('/api/auth/admin-')) {
        return
    }

    // Allow the stats endpoint if needed? No, that should be protected.

    const token = getCookie(event, 'admin_token')

    if (!token) {
        throw createError({
            statusCode: 401,
            message: 'Unauthorized',
        })
    }

    const validSession = await db.select().from(schema.adminSessions).where(
        and(
            eq(schema.adminSessions.token, token),
            gt(schema.adminSessions.expiresAt, new Date())
        )
    ).limit(1)

    if (validSession.length === 0) {
        throw createError({ statusCode: 401, message: 'Session expired' })
    }
})
