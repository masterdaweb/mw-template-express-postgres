/** The page in the visitor's language: Portuguese when the browser prefers it, English otherwise. */
const en = {
  title: 'Your Node.js API is live',
  lead: 'Express with PostgreSQL and a private bucket: files sent below are stored in the bucket, described in the database, and downloaded through links that expire in 15 minutes.',
  reaches: 'What this API reaches',
  send: 'Send a file',
  file: 'File',
  submit: 'Send to Object Storage',
  sent: name => `${name} was saved.`,
  empty: 'Choose a file first.',
  failed: 'The file could not be saved. See the service logs.',
  none: 'No files yet.',
  download: 'download (link valid for 15 min)',
  api: 'The same as JSON',
  next: 'Next steps',
  step1: 'Make the code yours: in the console, open this project and follow “Your code” to copy it to your GitHub and connect it.',
  step2: 'Add a table in migrations/ and a route in src/server.js, then push: the migration runs once, before the new version takes traffic.',
  step3: 'Add your own domain on the api service, under Domains.'
}
const pt = {
  title: 'Sua API Node.js está no ar',
  lead: 'Express com PostgreSQL e um bucket privado: os arquivos enviados abaixo ficam no bucket, são descritos no banco e baixados por links que expiram em 15 minutos.',
  reaches: 'O que esta API alcança',
  send: 'Envie um arquivo',
  file: 'Arquivo',
  submit: 'Enviar para o Object Storage',
  sent: name => `${name} foi salvo.`,
  empty: 'Escolha um arquivo primeiro.',
  failed: 'Não foi possível salvar o arquivo. Veja os logs do serviço.',
  none: 'Nenhum arquivo ainda.',
  download: 'baixar (link válido por 15 min)',
  api: 'O mesmo em JSON',
  next: 'Próximos passos',
  step1: 'Torne o código seu: no console, abra este projeto e siga “Seu código” para copiá-lo para o seu GitHub e conectá-lo.',
  step2: 'Crie uma tabela em migrations/ e uma rota em src/server.js e faça push: a migração roda uma vez, antes de a nova versão receber tráfego.',
  step3: 'Adicione o seu domínio no serviço api, em Domínios.'
}

export function texts(acceptLanguage) {
  const first = String(acceptLanguage ?? '').split(',')[0].trim().toLowerCase()
  return first.startsWith('pt') ? { lang: 'pt-BR', t: pt } : { lang: 'en', t: en }
}
