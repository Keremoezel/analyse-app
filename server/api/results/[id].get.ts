import { db, schema } from '../../db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')

    if (!id || isNaN(Number(id))) {
        throw createError({
            statusCode: 400,
            message: 'Ungültige Ergebnis-ID',
        })
    }

    const result = await db.query.results.findFirst({
        where: eq(schema.results.id, Number(id)),
        with: {
            // We need to define relation for this to work
        },
    })

    if (!result) {
        throw createError({
            statusCode: 404,
            message: 'Ergebnis nicht gefunden',
        })
    }

    // Get user email
    const user = await db.query.users.findFirst({
        where: eq(schema.users.id, result.userId),
    })

    return {
        id: result.id,
        email: user?.email,
        scores: {
            D: result.dScore,
            I: result.iScore,
            S: result.sScore,
            G: result.gScore,
        },
        createdAt: result.createdAt,
    }
})
