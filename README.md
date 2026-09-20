# WJ Imports — refatorado

### Render
Start Command:
`node server.js`

Variáveis:
- `SUPERFRETE_TOKEN`: token da sua conta SuperFrete.
- `SUPERFRETE_ORIGIN_CEP`: CEP de origem da loja, somente números.
- `SUPERFRETE_BASE_URL`: opcional; padrão `https://api.superfrete.com`.

O token fica no servidor e não é exposto no navegador. O frontend chama `/api/frete`, e o `server.js` faz a cotação autenticada.

O catálogo original foi preservado e os caminhos das imagens continuam apontando para `imgs/...`.
