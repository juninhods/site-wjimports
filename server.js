const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 10000);
const HOST = "0.0.0.0";

const SUPERFRETE_BASE_URL = (
  process.env.SUPERFRETE_BASE_URL ||
  "https://api.superfrete.com"
).replace(/\/$/, "");

const SUPERFRETE_TOKEN =
  process.env.SUPERFRETE_TOKEN || "";

// CEP FIXO DA WJ IMPORTS
const ORIGIN_CEP = "11900000";

// PESO PADRÃO POR PRODUTO
const DEFAULT_PRODUCT_WEIGHT = 0.5;

// DIMENSÕES PADRÃO
const DEFAULT_PACKAGE = {
  height: 10,
  width: 15,
  length: 20
};

// =====================================================
// JSON
// =====================================================

function sendJson(res, status, data) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });

  res.end(JSON.stringify(data));
}

// =====================================================
// BODY
// =====================================================

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", chunk => {
      body += chunk;

      if (body.length > 100000) {
        reject(new Error("Dados enviados são muito grandes."));
        req.destroy();
      }
    });

    req.on("end", () => {
      if (!body.trim()) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("JSON inválido."));
      }
    });

    req.on("error", reject);
  });
}

// =====================================================
// NÚMERO
// =====================================================

function numberOr(value, fallback) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
}

// =====================================================
// NORMALIZAÇÃO DOS FRETES
// =====================================================

function normalizeRate(rate) {
  const price = numberOr(
    rate?.price ??
    rate?.total_price ??
    rate?.amount ??
    rate?.cost ??
    rate?.value,
    0
  );

  const name =
    rate?.name ||
    rate?.service_name ||
    rate?.service ||
    rate?.description ||
    rate?.company?.name ||
    "Envio";

  const company =
    rate?.company?.name ||
    rate?.company_name ||
    rate?.carrier?.name ||
    rate?.carrier ||
    "";

  const deliveryTime =
    rate?.delivery_time ??
    rate?.deliveryTime ??
    rate?.deadline ??
    rate?.delivery_days ??
    rate?.deliveryDays ??
    rate?.days ??
    rate?.delivery_range ??
    "";

  return {
    id:
      rate?.id ??
      rate?.service_id ??
      rate?.serviceCode ??
      rate?.code ??
      null,

    name: String(name),

    company: String(company),

    price,

    deliveryTime: String(deliveryTime)
  };
}

// =====================================================
// EXTRAIR SERVIÇOS
// =====================================================

function extractServices(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.services)) {
    return data.services;
  }

  if (Array.isArray(data?.rates)) {
    return data.rates;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
}

// =====================================================
// CALCULAR FRETE
// =====================================================

async function calculateShipping(body) {
  if (!SUPERFRETE_TOKEN) {
    throw new Error(
      "SUPERFRETE_TOKEN não configurado no servidor."
    );
  }

  const cepDestino = String(
    body.cep ||
    body.cepDestino ||
    body.destinationCep ||
    ""
  ).replace(/\D/g, "");

  if (cepDestino.length !== 8) {
    throw new Error(
      "CEP de destino inválido."
    );
  }

  // ===================================================
  // QUANTIDADE
  // ===================================================

  const quantity = Math.max(
    1,
    Math.min(
      20,
      Math.floor(
        numberOr(body.quantity, 1)
      )
    )
  );

  // ===================================================
  // PESO
  //
  // 500 GRAMAS POR PRODUTO
  // ===================================================

  const weightPerProduct = Math.max(
    DEFAULT_PRODUCT_WEIGHT,
    numberOr(
      body.weight,
      DEFAULT_PRODUCT_WEIGHT
    )
  );

  const totalWeight =
    weightPerProduct * quantity;

  // ===================================================
  // DIMENSÕES
  // ===================================================

  const height = Math.max(
    1,
    numberOr(
      body.height,
      DEFAULT_PACKAGE.height
    )
  );

  const width = Math.max(
    1,
    numberOr(
      body.width,
      DEFAULT_PACKAGE.width
    )
  );

  const length = Math.max(
    1,
    numberOr(
      body.length,
      DEFAULT_PACKAGE.length
    )
  );

  // ===================================================
  // PAYLOAD SUPERFRETE
  // ===================================================

  const payload = {
    from: {
      postal_code: ORIGIN_CEP
    },

    to: {
      postal_code: cepDestino
    },

    services: "1,2,17,3,33,31",

    package: {
      weight: totalWeight,
      height,
      width,
      length
    },

    options: {
      own_hand: false,
      receipt: false,
      insurance_value: 0,
      use_insurance_value: false
    }
  };

  console.log("");
  console.log("==========================================");
  console.log("WJ IMPORTS - SUPERFRETE");
  console.log("==========================================");

  console.log("Origem:", ORIGIN_CEP);
  console.log("Destino:", cepDestino);
  console.log("Quantidade:", quantity);
  console.log(
    "Peso por produto:",
    `${weightPerProduct} kg`
  );
  console.log(
    "Peso total:",
    `${totalWeight} kg`
  );

  console.log(
    "Dimensões:",
    `${height} x ${width} x ${length} cm`
  );

  console.log(
    "Payload:",
    JSON.stringify(payload, null, 2)
  );

  // ===================================================
  // CHAMADA SUPERFRETE
  // ===================================================

  const response = await fetch(
    `${SUPERFRETE_BASE_URL}/api/v0/calculator`,
    {
      method: "POST",

      headers: {
        Accept: "application/json",

        "Content-Type":
          "application/json",

        "User-Agent":
          "WJ-Imports/1.0",

        Authorization:
          `Bearer ${SUPERFRETE_TOKEN}`
      },

      body: JSON.stringify(payload)
    }
  );

  const responseText =
    await response.text();

  console.log(
    "HTTP SuperFrete:",
    response.status
  );

  console.log(
    "Resposta:",
    responseText
  );

  let data;

  try {
    data =
      JSON.parse(responseText);
  } catch {
    data = {
      raw: responseText
    };
  }

  // ===================================================
  // ERRO SUPERFRETE
  // ===================================================

  if (!response.ok) {
    let message =
      data?.message ||
      data?.error ||
      data?.detail ||
      data?.errors?.[0]?.message ||
      data?.errors?.[0] ||
      `SuperFrete retornou HTTP ${response.status}.`;

    if (
      typeof message !== "string"
    ) {
      message =
        JSON.stringify(message);
    }

    throw new Error(message);
  }

  // ===================================================
  // SERVIÇOS
  // ===================================================

  const services =
    extractServices(data);

  // ===================================================
  // NORMALIZA
  // ===================================================

  const rates = services
    .map(normalizeRate)
    .filter(rate =>
      rate.price > 0
    )
    .sort(
      (a, b) =>
        a.price - b.price
    );

  console.log(
    "Fretes encontrados:",
    rates.length
  );

  console.log(
    JSON.stringify(
      rates,
      null,
      2
    )
  );

  // ===================================================
  // RESPOSTA PARA O FRONTEND
  // ===================================================

  return {
    rates
  };
}

// =====================================================
// ARQUIVOS DO SITE
// =====================================================

function getContentType(filePath) {
  const extension =
    path
      .extname(filePath)
      .toLowerCase();

  const types = {
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

  return (
    types[extension] ||
    "application/octet-stream"
  );
}

// =====================================================
// STATIC
// =====================================================

function serveStatic(req, res) {
  let requestedPath =
    req.url.split("?")[0];

  if (
    requestedPath === "/" ||
    requestedPath === ""
  ) {
    requestedPath =
      "/index.html";
  }

  const relativePath =
    requestedPath.replace(
      /^\/+/,
      ""
    );

  const filePath =
    path.join(
      __dirname,
      relativePath
    );

  const normalized =
    path.normalize(filePath);

  if (
    !normalized.startsWith(
      path.resolve(__dirname)
    )
  ) {
    res.writeHead(403);
    return res.end(
      "Acesso negado."
    );
  }

  fs.readFile(
    normalized,
    (error, data) => {
      if (error) {
        res.writeHead(
          404,
          {
            "Content-Type":
              "text/plain; charset=utf-8"
          }
        );

        return res.end(
          "Arquivo não encontrado."
        );
      }

      res.writeHead(
        200,
        {
          "Content-Type":
            getContentType(
              normalized
            )
        }
      );

      res.end(data);
    }
  );
}

// =====================================================
// SERVIDOR
// =====================================================

const server =
  http.createServer(
    async (req, res) => {

      try {

        // CORS
        if (
          req.method ===
          "OPTIONS"
        ) {
          res.writeHead(
            204,
            {
              "Access-Control-Allow-Origin":
                "*",

              "Access-Control-Allow-Methods":
                "GET, POST, OPTIONS",

              "Access-Control-Allow-Headers":
                "Content-Type",

              "Access-Control-Max-Age":
                "86400"
            }
          );

          return res.end();
        }

        // =============================================
        // HEALTH
        // =============================================

        if (
          req.method === "GET" &&
          req.url === "/api/health"
        ) {
          return sendJson(
            res,
            200,
            {
              ok: true,

              superfreteConfigured:
                Boolean(
                  SUPERFRETE_TOKEN
                ),

              originCep:
                ORIGIN_CEP,

              defaultProductWeight:
                "0.5 kg",

              packageDimensions:
                DEFAULT_PACKAGE
            }
          );
        }

        // =============================================
        // FRETE
        // =============================================

        if (
          req.method === "POST" &&
          req.url === "/api/frete"
        ) {
          const body =
            await readJsonBody(req);

          const result =
            await calculateShipping(
              body
            );

          return sendJson(
            res,
            200,
            result
          );
        }

        // =============================================
        // SITE
        // =============================================

        if (
          req.method === "GET"
        ) {
          return serveStatic(
            req,
            res
          );
        }

        return sendJson(
          res,
          404,
          {
            error:
              "Rota não encontrada."
          }
        );

      } catch (error) {

        console.error("");
        console.error(
          "=========================================="
        );
        console.error(
          "ERRO WJ IMPORTS"
        );
        console.error(
          "=========================================="
        );
        console.error(
          error
        );

        return sendJson(
          res,
          500,
          {
            error:
              error?.message ||
              "Não foi possível calcular o frete."
          }
        );
      }
    }
  );

// =====================================================
// START
// =====================================================

server.listen(
  PORT,
  HOST,
  () => {

    console.log("");
    console.log(
      "=========================================="
    );

    console.log(
      `WJ Imports API rodando em ${HOST}:${PORT}`
    );

    console.log(
      `SuperFrete: ${
        SUPERFRETE_TOKEN
          ? "configurado"
          : "NÃO CONFIGURADO"
      }`
    );

    console.log(
      `CEP origem: ${ORIGIN_CEP}`
    );

    console.log(
      "Peso padrão: 500 g por produto"
    );

    console.log(
      "Dimensões: 10 x 15 x 20 cm"
    );

    console.log(
      "=========================================="
    );
  }
);