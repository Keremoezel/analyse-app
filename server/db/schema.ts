import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

// Users table
export const users = sqliteTable('users', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    email: text('email').notNull().unique(),
    createdAt: integer('created_at').notNull().$defaultFn(() => Date.now()),
})

// Results table
export const results = sqliteTable('results', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: integer('user_id').notNull().references(() => users.id),
    dScore: integer('d_score').notNull(),
    iScore: integer('i_score').notNull(),
    sScore: integer('s_score').notNull(),
    gScore: integer('g_score').notNull(),
    rawData: text('raw_data'),
    createdAt: integer('created_at').notNull().$defaultFn(() => Date.now()),
})
