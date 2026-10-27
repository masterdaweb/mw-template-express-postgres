// The release command (`npm run migrate`): runs once per deploy, before the
// new version takes traffic. Each file in migrations/ runs once, in order,
// inside a transaction; a failure stops the deploy and the old version stays.
import { readdir, readFile } from 'node:fs/promises'
import { pool } from './db.js'

const db = pool(true)
const client = await db.connect()
try {
  await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, ran_at timestamptz NOT NULL DEFAULT now())')
  const done = new Set((await client.query('SELECT name FROM schema_migrations')).rows.map(r => r.name))
  const files = (await readdir(new URL('../migrations/', import.meta.url))).filter(f => f.endsWith('.sql')).sort()
  for (const file of files) {
    if (done.has(file)) continue
    const sql = await readFile(new URL(`../migrations/${file}`, import.meta.url), 'utf8')
    await client.query('BEGIN')
    try {
      await client.query(sql)
      await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file])
      await client.query('COMMIT')
      console.log(`migrated ${file}`)
    } catch (e) {
      await client.query('ROLLBACK')
      throw new Error(`${file}: ${e.message}`)
    }
  }
  console.log('migrations up to date')
} finally {
  client.release()
  await db.end()
}
