import { pgTable, text, integer, serial, timestamp, jsonb } from 'drizzle-orm/pg-core'

// Users table
export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    email: text('email').notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Results table
export const results = pgTable('results', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id),
    dScore: integer('d_score').notNull(),
    iScore: integer('i_score').notNull(),
    sScore: integer('s_score').notNull(),
    gScore: integer('g_score').notNull(),
    rawData: jsonb('raw_data'),
    slug: text('slug').notNull().unique(), // Secure URL identifier
    createdAt: timestamp('created_at').defaultNow().notNull(),
})
