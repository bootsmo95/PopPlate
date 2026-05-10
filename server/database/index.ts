import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Singleton pattern to avoid multiple connections in dev (Nuxt HMR)
type DbInstance = ReturnType<typeof drizzle<typeof schema>>

let _db: DbInstance | undefined

function getDb(): DbInstance {
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

export const db = new Proxy({} as DbInstance, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver)
  },
})
export { schema }
