# Node.js API + PostgreSQL na Master da Web

Uma API em Node.js (Express 5) com PostgreSQL, arquivos privados no Object Storage com links temporários e uma migração a cada deploy.

| Serviço | O que roda |
| --- | --- |
| `api` | `npm start`; `npm run migrate` roda uma vez por deploy, antes de a nova versão receber tráfego |

O banco chega como `DATABASE_URL` (pelo pooler, para o app) e `DATABASE_DIRECT_URL` (direto no servidor, para as migrações); o bucket privado como `MW_STORAGE_*`. Os arquivos nunca são públicos: cada link de download é assinado e expira em 15 minutos.

`POST /api/files` (campo `file`) guarda um arquivo; `GET /api/files` lista com os links. A página inicial faz o mesmo pelo navegador.

## Torne o código seu

1. No console, abra o projeto e siga **Seu código**: copie este template
   para o seu GitHub e conecte a cópia ao projeto.
2. Altere `src/server.js` e `migrations/` e faça push: cada push faz um deploy, sem tirar o
   app do ar.

## Rodar na sua máquina

```bash
npm install
export $(grep -v ^# .env.example | xargs)   # ajuste os valores / adjust the values
npm run migrate && npm start
```

## Bom saber

- Uma migração nova é um arquivo `migrations/NNN_nome.sql`: roda uma vez, em ordem, numa transação.

*[English](README.en.md)*
