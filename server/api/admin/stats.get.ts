import { db, schema } from '../../db'
import { sql, count, desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
    // 1. Total Tests (Last 30 Days)
    const totalTestsResult = await db.select({ value: count() }).from(schema.results)
    const totalTests = totalTestsResult[0]?.value ?? 0

    // 2. Contact Conversion Rate
    // Use SQL for conditional count if needed, but separate count also works
    const totalCountResult = await db.select({ value: count() }).from(schema.results)
    const contactedCountResult = await db.select({ value: count(schema.results.contactedAt) }).from(schema.results)

    const total = totalCountResult[0]?.value ?? 0
    const contacted = contactedCountResult[0]?.value ?? 0

    const conversionRate = total > 0
        ? Math.round((contacted / total) * 100)
        : 0

    // 3. Weekly Trends
    // Use raw SQL for date grouping to be safe across drivers
    const dailyStats = await db.select({
        date: sql<string>`DATE(created_at)`,
        count: count()
    })
        .from(schema.results)
        .groupBy(sql`DATE(created_at)`)
        .orderBy(desc(sql`DATE(created_at)`))
        .limit(7)

    return {
        totalTests,
        conversionRate,
        dailyStats: dailyStats.reverse()
    }
})
