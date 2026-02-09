import { db, schema } from '../../db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
    const token = getCookie(event, 'admin_token')

    if (token) {
        // Delete from DB to invalidate immediately
        await db.delete(schema.adminSessions).where(eq(schema.adminSessions.token, token))
    }

    // Clear Cookie
    deleteCookie(event, 'admin_token')

    return { success: true }
})
