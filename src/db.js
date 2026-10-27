import pg from 'pg'

/**
 * PostgreSQL from the binding: DATABASE_URL goes through the pooler (for the
 * app's many short queries); DATABASE_DIRECT_URL reaches the server itself
 * (for migrations, which want one session of their own).
 */
export function pool(direct = false) {
  const url = direct ? process.env.DATABASE_DIRECT_URL || process.env.DATABASE_URL : process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is empty: connect a database to this service')
  return new pg.Pool({ connectionString: url, max: 5 })
}
