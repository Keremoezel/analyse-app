import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Create Drizzle instance
const client = postgres(process.env.POSTGRES_URL!)
export const db = drizzle(client, { schema })
export { schema }

/* 
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
const client = postgres(process.env.POSTGRES_URL!)
export const db = drizzle(client, { schema }) */