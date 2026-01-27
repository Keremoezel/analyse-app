import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'
import { existsSync, mkdirSync } from 'fs'
import { join } from 'path'

// Get the project root directory
const dataDir = join(process.cwd(), '.data')

// Ensure .data directory exists
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true })
}

const dbPath = join(dataDir, 'disg.db')
const sqlite = new Database(dbPath)

// Enable WAL mode for better performance
sqlite.pragma('journal_mode = WAL')

// Create tables if they don't exist
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
  );
  
  CREATE TABLE IF NOT EXISTS results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    d_score INTEGER NOT NULL,
    i_score INTEGER NOT NULL,
    s_score INTEGER NOT NULL,
    g_score INTEGER NOT NULL,
    raw_data TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
  );
`)

export const db = drizzle(sqlite, { schema })
export { schema }
