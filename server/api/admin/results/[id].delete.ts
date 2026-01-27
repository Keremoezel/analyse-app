import { db, schema } from '../../../db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')

    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'ID fehlt',
        })
    }

    // Delete result
    await db.delete(schema.results)
        .where(eq(schema.results.id, parseInt(id)))

    return {
        success: true
    }
})
