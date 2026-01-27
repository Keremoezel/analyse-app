import { sql } from '@vercel/postgres'
import { drizzle } from 'drizzle-orm/vercel-postgres'
import * as schema from './schema'

// Create Drizzle instance
export const db = drizzle(sql, { schema })
export { schema }
