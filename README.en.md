# Node.js API + PostgreSQL on Master da Web

A Node.js (Express 5) API with PostgreSQL, private files on Object Storage with expiring links, and a migration on every deploy.

| Service | What it runs |
| --- | --- |
| `api` | `npm start`; `npm run migrate` runs once per deploy, before the new version takes traffic |

The database comes as `DATABASE_URL` (through the pooler, for the app) and `DATABASE_DIRECT_URL` (straight to the server, for migrations); the private bucket as `MW_STORAGE_*`. Files are never public: each download link is signed and expires in 15 minutes.

`POST /api/files` (field `file`) stores a file; `GET /api/files` lists them with their links. The home page does the same from the browser.

## Make it yours

1. In the console, open the project and follow **Your code**: copy this
   template to your GitHub and connect the copy to the project.
2. Change `src/server.js` and `migrations/`, then push: every push deploys, with no downtime.

## Run it on your machine

```bash
npm install
export $(grep -v ^# .env.example | xargs)   # ajuste os valores / adjust the values
npm run migrate && npm start
```

## Good to know

- A new migration is a `migrations/NNN_name.sql` file: it runs once, in order, in a transaction.

*[Português](README.md)*
