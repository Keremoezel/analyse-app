import { db, schema } from '../../../db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
    // Basic auth check can be added here if needed, 
    // but usually handled by middleware or parent route

    const idParam = getRouterParam(event, 'id')
    if (!idParam) {
        throw createError({
            statusCode: 400,
            message: 'ID required',
        })
    }

    const id = parseInt(idParam)
    if (isNaN(id)) {
        throw createError({
            statusCode: 400,
            message: 'Invalid ID format',
        })
    }

    try {
        await db.delete(schema.results).where(eq(schema.results.id, id))
        return { success: true }
    } catch (error: any) {
        console.error('Error deleting result:', error)
        throw createError({
            statusCode: 500,
            message: 'Failed to delete result',
        })
    }
})
