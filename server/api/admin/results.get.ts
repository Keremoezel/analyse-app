import { db, schema } from '../../db'
import { desc, eq, count } from 'drizzle-orm'

interface ResultQuery {
    page?: string
    limit?: string
}

export default defineEventHandler(async (event) => {
    const query = getQuery<ResultQuery>(event)
    const page = Math.max(1, parseInt(query.page || '1'))
    const limit = Math.max(1, Math.min(100, parseInt(query.limit || '20'))) // Max 100 to prevent misuse
    const offset = (page - 1) * limit

    // 1. Get request to count total entries
    const totalCountResult = await db.select({ value: count() }).from(schema.results)
    const total = totalCountResult[0]?.value ?? 0

    // 2. Get paginated data
    const data = await db.select({
        id: schema.results.id,
        email: schema.users.email,
        dScore: schema.results.dScore,
        iScore: schema.results.iScore,
        sScore: schema.results.sScore,
        gScore: schema.results.gScore,
        createdAt: schema.results.createdAt,
        contactedAt: schema.results.contactedAt,
        slug: schema.results.slug,
    })
        .from(schema.results)
        .leftJoin(schema.users, eq(schema.results.userId, schema.users.id))
        .orderBy(desc(schema.results.createdAt))
        .limit(limit)
        .offset(offset)

    return {
        data,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    }
})
