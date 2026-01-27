import { db, schema } from '../../db'
import { desc, eq } from 'drizzle-orm'

export default defineEventHandler(async () => {
    const results = await db.select({
        id: schema.results.id,
        email: schema.users.email,
        dScore: schema.results.dScore,
        iScore: schema.results.iScore,
        sScore: schema.results.sScore,
        gScore: schema.results.gScore,
        createdAt: schema.results.createdAt,
    })
        .from(schema.results)
        .leftJoin(schema.users, eq(schema.results.userId, schema.users.id))
        .orderBy(desc(schema.results.createdAt))

    return results
})
