import express from 'express'
import multer from 'multer'
import { randomUUID } from 'node:crypto'
import { pool } from './db.js'
import { check, put, signedLink } from './storage.js'
import { texts } from './texts.js'

const app = express()
const db = pool()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

// The platform's health check: the process is up.
app.get('/health', (_req, res) => res.json({ ok: true }))

/** Each part of the project, and whether this service reaches it. */
async function checks() {
  const probe = async fn => {
    try {
      return { ok: true, detail: await fn() }
    } catch (e) {
      return { ok: false, detail: String(e.message).split('\n')[0].slice(0, 160) }
    }
  }
  return {
    database: await probe(async () => (await db.query('SELECT version()')).rows[0].version.split(' ').slice(0, 2).join(' ')),
    storage: await probe(check)
  }
}

async function files() {
  const { rows } = await db.query('SELECT id, object_key, name, size, content_type, created_at FROM files ORDER BY id DESC LIMIT 20')
  return Promise.all(rows.map(async r => ({
    id: Number(r.id),
    name: r.name,
    size: Number(r.size),
    content_type: r.content_type,
    created_at: r.created_at,
    url: await signedLink(r.object_key, r.name)
  })))
}

app.get('/api/files', async (_req, res, next) => {
  try {
    res.json({ files: await files() })
  } catch (e) {
    next(e)
  }
})

/** A file to the bucket, its row to PostgreSQL. JSON for API calls, back to the page for the form. */
app.post('/api/files', upload.single('file'), async (req, res, next) => {
  const fromForm = req.accepts(['json', 'html']) === 'html'
  try {
    if (!req.file || req.file.size === 0) {
      return fromForm ? res.redirect(303, '/?error=empty') : res.status(400).json({ error: 'Send the file in the "file" field.' })
    }
    const key = `files/${randomUUID()}`
    await put(key, req.file.buffer, req.file.mimetype || 'application/octet-stream')
    const { rows } = await db.query(
      'INSERT INTO files (object_key, name, size, content_type) VALUES ($1, $2, $3, $4) RETURNING id',
      [key, req.file.originalname, req.file.size, req.file.mimetype || 'application/octet-stream']
    )
    if (fromForm) return res.redirect(303, `/?sent=${encodeURIComponent(req.file.originalname)}`)
    res.status(201).json({ id: Number(rows[0].id), name: req.file.originalname, url: await signedLink(key, req.file.originalname) })
  } catch (e) {
    if (fromForm) {
      console.error('upload failed:', e.message)
      return res.redirect(303, '/?error=failed')
    }
    next(e)
  }
})

app.get('/status.json', async (_req, res) => {
  const c = await checks()
  const ok = Object.values(c).every(x => x.ok)
  res.status(ok ? 200 : 503).json({ ok, checks: c })
})

const esc = s => String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' })[ch])
const kb = n => (n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`)

app.get('/', async (req, res) => {
  const { lang, t } = texts(req.get('accept-language'))
  const c = await checks()
  const list = c.database.ok && c.storage.ok ? await files().catch(() => []) : []
  const labels = { database: 'PostgreSQL', storage: 'Object Storage' }
  const note = req.query.sent
    ? `<p class="note ok" role="status">${esc(t.sent(req.query.sent))}</p>`
    : req.query.error ? `<p class="note bad" role="alert">${esc(req.query.error === 'empty' ? t.empty : t.failed)}</p>` : ''
  res.type('html').send(`<!DOCTYPE html>
<html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Node.js · Master da Web</title><link rel="stylesheet" href="/style.css"></head>
<body><main>
<div class="brand">Node.js · Express · Master da Web</div>
<h1>${esc(t.title)}</h1>
<p class="lead">${esc(t.lead)}</p>
<section><h2>${esc(t.reaches)}</h2><ul class="checks" data-testid="checks">
${Object.entries(c).map(([k, v]) => `<li data-check="${k}" data-ok="${v.ok}"><span class="dot ${v.ok ? 'ok' : 'bad'}"></span><span class="name">${labels[k]}</span><span class="detail ${v.ok ? '' : 'bad'}">${esc(v.detail)}</span></li>`).join('\n')}
</ul></section>
<section><h2>${esc(t.send)}</h2>
<form method="post" action="/api/files" enctype="multipart/form-data"><input type="file" name="file" required aria-label="${esc(t.file)}"><button type="submit">${esc(t.submit)}</button></form>
${note}
${list.length
    ? `<ul class="files" data-testid="uploads">${list.map(f => `<li><a href="${esc(f.url)}">${esc(f.name)}</a><span>${kb(f.size)} · ${esc(t.download)}</span></li>`).join('')}</ul>`
    : `<p class="muted">${esc(t.none)}</p>`}
<p class="muted"><a href="/api/files">GET /api/files</a> — ${esc(t.api)}</p>
</section>
<section><h2>${esc(t.next)}</h2><ol><li>${esc(t.step1)}</li><li>${esc(t.step2)}</li><li>${esc(t.step3)}</li></ol></section>
<footer>Node ${process.versions.node} · <a href="/status.json">status.json</a></footer>
</main></body></html>`)
})

app.use(express.static(new URL('../public', import.meta.url).pathname))

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'Something went wrong. See the service logs.' })
})

const port = Number(process.env.PORT) || 8080
// 0.0.0.0, not localhost: the platform reaches the app from outside the container.
app.listen(port, '0.0.0.0', () => console.log(`listening on :${port}`))
