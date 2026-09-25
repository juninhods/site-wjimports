const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 10000);
const HOST = "0.0.0.0";

const BASE = (
  process.env.SUPERFRETE_BASE_URL || "https://api.superfrete.com"
).replace(/\/$/, "");

const TOKEN = process.env.SUPERFRETE_TOKEN || "";

const ORIGIN = String(
  process.env.SUPERFRETE_ORIGIN_CEP || ""
).replace(/\D/g, "");

// =====================================================
// RESPOSTA JSON
// =====================================================

function send(res, status, data) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });

  res.end(JSON.stringify(data));
}

// =====================================================
// LER JSON DA REQUISIÇÃO
// =====================================================

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", chunk => {
      body += chunk;

      if (body.length > 100000) {
        reject(new Error("Payload muito grande."));
        req.destroy();
      }
    });

    req.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch {
        reject(new Error("JSON inválido."));
      }
    });

    req.on("error", reject);
  });
}

// =====================================================
// NORMALIZAR RESULTADO DA SUPERFRETE
// =====================================================

function normalize(rate) {
  const price = Number(
    rate?.price ??
    rate?.total_price ??
    rate?.amount ??
    rate?.cost ??
    rate?.value ??
    0
  );

  return {
    id:
      rate?.id ??
      rate?.service_id ??
      rate?.serviceCode ??
      rate?.code ??
      null,

    name:
      rate?.name ??
      rate?.service ??
      rate?.service_name ??
      rate?.description ??
      rate?.company?.name ??
      "Envio",

    company:
      rate?.company?.name ??
      rate?.carrier?.name ??
      "",

    price: Number.isFinite(price) ? price : 0,

    deliveryTime:
      rate?.delivery_time ??
      rate?.deliveryTime ??
      rate?.deadline ??
      rate?.delivery_days ??
      rate?.deliveryDays ??
      rate?.days ??
      rate?.delivery_range ??
      null
  };
}

// =====================================================
// CALCULAR FRETE
// =====================================================

async function calculate(body) {

  // ---------------------------------------------------
  // TOKEN
  // ---------------------------------------------------

  if (!TOKEN) {
    throw new Error(
      "SUPERFRETE_TOKEN não configurado no Render."
    );
  }

  // ---------------------------------------------------
  // CEP ORIGEM
  // ---------------------------------------------------

  if (ORIGIN.length !== 8) {
    throw new Error(
      "SUPERFRETE_ORIGIN_CEP não configurado corretamente no Render."
    );
  }

  // ---------------------------------------------------
  // CEP DESTINO
  // ---------------------------------------------------

  const cep = String(body.cep || "").replace(/\D/g, "");

  if (cep.length !== 8) {
    throw new Error("CEP de destino inválido.");
  }

  // ---------------------------------------------------
  // QUANTIDADE
  // ---------------------------------------------------

  const quantity = Math.max(
    1,
    Math.min(20, Number(body.quantity || 1))
  );

  // ---------------------------------------------------
  // PESO
  // ---------------------------------------------------

  const weight = Math.max(
    0.1,
    Number(body.weight || 0.3)
  );

  // ---------------------------------------------------
  // DIMENSÕES
  // ---------------------------------------------------

  const height = Math.max(
    1,
    Number(body.height || 10)
  );

  const width = Math.max(
    1,
    Number(body.width || 15)
  );

  const length = Math.max(
    1,
    Number(body.length || 20)
  );

  // ---------------------------------------------------
  // PAYLOAD
  // ---------------------------------------------------

  const payload = {
    from: {
      postal_code: ORIGIN
    },

    to: {
      postal_code: cep
    },

    package: {
      weight: weight * quantity,
      height,
      width,
      length
    }
  };

  console.log("=================================");
  console.log("CALCULANDO FRETE");
  console.log("=================================");

  console.log({
    origem: ORIGIN,
    destino: cep,
    quantidade: quantity,
    peso: weight * quantity,
    dimensoes: {
      height,
      width,
      length
    }
  });

  console.log(
    "Serviços: sem filtro — solicitando todas as opções disponíveis"
  );

  console.log("Payload enviado:");
  console.log(JSON.stringify(payload, null, 2));

  // ---------------------------------------------------
  // CHAMADA SUPERFRETE
  // ---------------------------------------------------

  const response = await fetch(
    `${BASE}/api/v0/calculator`,
    {
      method: "POST",

      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent": "WJ-Imports/1.0",
        Authorization: `Bearer ${TOKEN}`
      },

      body: JSON.stringify(payload)
    }
  );

  const responseText = await response.text();

  console.log("HTTP SuperFrete:", response.status);

  console.log("Resposta SuperFrete:");
  console.log(responseText);

  let data;

  try {
    data = JSON.parse(responseText);
  } catch {
    data = {
      raw: responseText
    };
  }

  // ---------------------------------------------------
  // ERRO SUPERFRETE
  // ---------------------------------------------------

  if (!response.ok) {

    console.error(
      "================================="
    );

    console.error(
      "ERRO SUPERFRETE"
    );

    console.error(
      "STATUS:",
      response.status
    );

    console.error(
      "RESPOSTA:",
      data
    );

    console.error(
      "================================="
    );

    let mensagem =
      data?.message ||
      data?.error ||
      data?.errors?.[0]?.message ||
      data?.errors?.[0] ||
      data?.detail ||
      data?.details ||
      `SuperFrete retornou HTTP ${response.status}.`;

    if (typeof mensagem !== "string") {
      mensagem = JSON.stringify(mensagem);
    }

    throw new Error(mensagem);
  }

  // ---------------------------------------------------
  // LOCALIZAR SERVIÇOS
  // ---------------------------------------------------

  let raw = [];

  if (Array.isArray(data)) {
    raw = data;
  }

  else if (Array.isArray(data?.services)) {
    raw = data.services;
  }

  else if (Array.isArray(data?.rates)) {
    raw = data.rates;
  }

  else if (Array.isArray(data?.data)) {
    raw = data.data;
  }

  else if (Array.isArray(data?.results)) {
    raw = data.results;
  }

  // ---------------------------------------------------
  // NORMALIZAR
  // ---------------------------------------------------

  const rates = raw
    .map(normalize)
    .filter(rate => rate.price > 0)
    .sort((a, b) => a.price - b.price);

  console.log(
    `Fretes encontrados: ${rates.length}`
  );

  console.log(
    JSON.stringify(rates, null, 2)
  );

  return {
    rates
  };
}

// =====================================================
// SERVIR ARQUIVOS DO SITE
// =====================================================

function serveStatic(req, res) {

  let requestedPath = req.url.split("?")[0];

  if (requestedPath === "/") {
    requestedPath = "/index.html";
  }

  // Segurança básica
  const safePath = path
    .normalize(requestedPath)
    .replace(/^(\.\.[\/\\])+/, "");

  const filePath = path.join(
    __dirname,
    safePath
  );

  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  fs.readFile(filePath, (error, data) => {

    if (error) {
      res.writeHead(404, {
        "Content-Type": "text/plain; charset=utf-8"
      });

      return res.end("Arquivo não encontrado.");
    }

    const extension = path
      .extname(filePath)
      .toLowerCase();

    const contentTypes = {

      ".html":
        "text/html; charset=utf-8",

      ".css":
        "text/css; charset=utf-8",

      ".js":
        "application/javascript; charset=utf-8",

      ".json":
        "application/json; charset=utf-8",

      ".png":
        "image/png",

      ".jpg":
        "image/jpeg",

      ".jpeg":
        "image/jpeg",

      ".webp":
        "image/webp",

      ".gif":
        "image/gif",

      ".svg":
        "image/svg+xml",

      ".ico":
        "image/x-icon",

      ".woff":
        "font/woff",

      ".woff2":
        "font/woff2"
    };

    res.writeHead(200, {
      "Content-Type":
        contentTypes[extension] ||
        "application/octet-stream"
    });

    res.end(data);
  });
}

// =====================================================
// SERVIDOR
// =====================================================

const server = http.createServer(
  async (req, res) => {

    try {

      // ------------------------------------------------
      // CORS PREFLIGHT
      // ------------------------------------------------

      if (req.method === "OPTIONS") {

        res.writeHead(204, {

          "Access-Control-Allow-Origin":
            "*",

          "Access-Control-Allow-Methods":
            "POST, GET, OPTIONS",

          "Access-Control-Allow-Headers":
            "Content-Type",

          "Access-Control-Max-Age":
            "86400"
        });

        return res.end();
      }

      // ------------------------------------------------
      // API FRETE
      // ------------------------------------------------

      if (
        req.method === "POST" &&
        req.url === "/api/frete"
      ) {

        const body =
          await readBody(req);

        const result =
          await calculate(body);

        return send(
          res,
          200,
          result
        );
      }

      // ------------------------------------------------
      // HEALTH
      // ------------------------------------------------

      if (
        req.method === "GET" &&
        req.url === "/api/health"
      ) {

        return send(
          res,
          200,
          {
            ok: true,

            superfreteConfigured:
              Boolean(
                TOKEN &&
                ORIGIN.length === 8
              )
          }
        );
      }

      // ------------------------------------------------
      // SITE
      // ------------------------------------------------

      if (req.method === "GET") {

        return serveStatic(
          req,
          res
        );
      }

      // ------------------------------------------------
      // ROTA NÃO ENCONTRADA
      // ------------------------------------------------

      return send(
        res,
        404,
        {
          error:
            "Rota não encontrada."
        }
      );

    }

    catch (error) {

      console.error(
        "================================="
      );

      console.error(
        "ERRO NO SERVIDOR:"
      );

      console.error(
        error
      );

      console.error(
        "================================="
      );

      return send(
        res,
        500,
        {
          error:
            error.message ||
            "Erro interno do servidor."
        }
      );
    }
  }
);

// =====================================================
// INICIAR
// ===================================================

server.listen(
  PORT,
  HOST,
  () => {

    console.log(
      `WJ Imports API rodando em ${HOST}:${PORT}`
    );

    console.log(
      `SuperFrete: ${
        TOKEN
          ? "configurado"
          : "ausente"
      }`
    );

    console.log(
      `CEP origem: ${
        ORIGIN ||
        "ausente"
      }`
    );
  }
);