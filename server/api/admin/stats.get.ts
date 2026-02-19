import { db, schema } from '../../db'
import { sql, count, desc, gte, and, lt } from 'drizzle-orm'

export default defineEventHandler(async () => {
    const now = new Date()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Week boundaries (Monday-based)
    const today = new Date(now)
    const dayOfWeek = today.getDay() // 0=Sun, 1=Mon...
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    const thisMonday = new Date(today)
    thisMonday.setDate(today.getDate() - mondayOffset)
    thisMonday.setHours(0, 0, 0, 0)

    const lastMonday = new Date(thisMonday)
    lastMonday.setDate(thisMonday.getDate() - 7)

    // 1. Total Tests (Last 30 Days)
    const totalTestsResult = await db.select({ value: count() })
        .from(schema.results)
        .where(gte(schema.results.createdAt, thirtyDaysAgo))
    const totalTests = totalTestsResult[0]?.value ?? 0

    // 2. Contact Conversion Rate (Last 30 Days)
    const contactedCountResult = await db.select({ value: count(schema.results.contactedAt) })
        .from(schema.results)
        .where(gte(schema.results.createdAt, thirtyDaysAgo))
    const contacted = contactedCountResult[0]?.value ?? 0

    const conversionRate = totalTests > 0
        ? Math.round((contacted / totalTests) * 100)
        : 0

    // 3. Total Tests (All Time)
    const totalAllTimeResult = await db.select({ value: count() }).from(schema.results)
    const totalAllTime = totalAllTimeResult[0]?.value ?? 0

    // 4. Daily Stats (Last 30 Days)
    const dailyStats = await db.select({
        date: sql<string>`DATE(created_at)`,
        count: count()
    })
        .from(schema.results)
        .where(gte(schema.results.createdAt, thirtyDaysAgo))
        .groupBy(sql`DATE(created_at)`)
        .orderBy(desc(sql`DATE(created_at)`))
        .limit(30)

    // 5. DISG Character Distribution (All Time)
    // Determine dominant type for each result
    const allResults = await db.select({
        dScore: schema.results.dScore,
        iScore: schema.results.iScore,
        sScore: schema.results.sScore,
        gScore: schema.results.gScore,
    }).from(schema.results)

    const typeCount = { D: 0, I: 0, S: 0, G: 0 }
    for (const r of allResults) {
        const scores = [
            { type: 'D' as const, score: r.dScore },
            { type: 'I' as const, score: r.iScore },
            { type: 'S' as const, score: r.sScore },
            { type: 'G' as const, score: r.gScore },
        ]
        const dominant = scores.reduce((a, b) => a.score >= b.score ? a : b)
        typeCount[dominant.type]++
    }

    const typeDistribution = {
        D: totalAllTime > 0 ? Math.round((typeCount.D / totalAllTime) * 100) : 0,
        I: totalAllTime > 0 ? Math.round((typeCount.I / totalAllTime) * 100) : 0,
        S: totalAllTime > 0 ? Math.round((typeCount.S / totalAllTime) * 100) : 0,
        G: totalAllTime > 0 ? Math.round((typeCount.G / totalAllTime) * 100) : 0,
        counts: typeCount,
    }

    // 6. Weekly comparison
    const thisWeekResult = await db.select({ value: count() })
        .from(schema.results)
        .where(gte(schema.results.createdAt, thisMonday))
    const testsThisWeek = thisWeekResult[0]?.value ?? 0

    const lastWeekResult = await db.select({ value: count() })
        .from(schema.results)
        .where(and(
            gte(schema.results.createdAt, lastMonday),
            lt(schema.results.createdAt, thisMonday)
        ))
    const testsLastWeek = lastWeekResult[0]?.value ?? 0

    return {
        totalTests,
        totalAllTime,
        conversionRate,
        testsThisWeek,
        testsLastWeek,
        dailyStats: dailyStats.reverse(),
        typeDistribution,
    }
})
