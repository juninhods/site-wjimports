# WJ Imports — versão pronta para hospedagem

## Render
Start Command: `node server.js`

Variáveis obrigatórias:
- `SUPERFRETE_TOKEN`
- `SUPERFRETE_ORIGIN_CEP`

Opcional: `SUPERFRETE_BASE_URL` (padrão `https://api.superfrete.com`).

O `server.js` serve o site e a pasta `imgs/` e mantém o token da SuperFrete somente no servidor.

O checkout possui catálogo, filtros, carrinho, busca automática de endereço por CEP, preenchimento manual quando faltarem dados, cotação real via SuperFrete, opção de combinar entrega e resumo completo pelo WhatsApp.

Mantenha a pasta `imgs/` no mesmo nível de `index.html`.
