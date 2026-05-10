import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Singleton pattern to avoid multiple connections in dev (Nuxt HMR)
let _db: ReturnType<typeof drizzle<typeof schema>> | undefined

function getDb() {
  if (!_db) {
    const url = process.env.DATABASE_URL
    if (!url) {
      throw new Error('DATABASE_URL environment variable is not set')
    }
    const client = postgres(url)
    _db = drizzle(client, { schema })
  }
  return _db
}

export const db = getDb()
export { schema }
