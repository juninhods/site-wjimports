const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 10000);
const HOST = "0.0.0.0";

const BASE = (
  process.env.SUPERFRETE_BASE_URL ||
  "https://api.superfrete.com"
).replace(/\/$/, "");

const TOKEN = process.env.SUPERFRETE_TOKEN || "";

const ORIGIN = String(
  process.env.SUPERFRETE_ORIGIN_CEP || "11900000"
).replace(/\D/g, "");

const DEFAULT_WEIGHT = 0.5; // 500 g por produto

const DEFAULT_DIMENSIONS = {
  height: 10,
  width: 15,
  length: 20
};

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
// LER JSON
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
// NORMALIZAR RESULTADO
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
  if (!TOKEN) {
    throw new Error(
      "SUPERFRETE_TOKEN não configurado no Render."
    );
  }

  if (ORIGIN.length !== 8) {
    throw new Error(
      "SUPERFRETE_ORIGIN_CEP não configurado corretamente."
    );
  }

  // CEP destino
  const cep = String(
    body.cep || body.cepDestino || ""
  ).replace(/\D/g, "");

  if (cep.length !== 8) {
    throw new Error("CEP de destino inválido.");
  }

  // Quantidade
  const quantity = Math.max(
    1,
    Math.min(
      20,
      Number(body.quantity || 1)
    )
  );

  // ===================================================
  // PESO
  // 500 g POR PRODUTO
  // ===================================================

  const weight = Math.max(
    0.1,
    Number(body.weight || DEFAULT_WEIGHT)
  );

  const totalWeight = weight * quantity;

  // ===================================================
  // DIMENSÕES
  // ===================================================

  const height = Math.max(
    1,
    Number(
      body.height ||
      DEFAULT_DIMENSIONS.height
    )
  );

  const width = Math.max(
    1,
    Number(
      body.width ||
      DEFAULT_DIMENSIONS.width
    )
  );

  const length = Math.max(
    1,
    Number(
      body.length ||
      DEFAULT_DIMENSIONS.length
    )
  );

  // ===================================================
  // PAYLOAD SUPERFRETE
  // ===================================================

  const payload = {
    from: {
      postal_code: ORIGIN
    },

    to: {
      postal_code: cep
    },

    package: {
      weight: totalWeight,
      height,
      width,
      length
    },

    services: "1,2,17,3,33,31",

    options: {
      own_hand: false,
      receipt: false,
      insurance_value: 0,
      use_insurance_value: false
    }
  };

  console.log("");
  console.log("=================================");
  console.log("WJ IMPORTS - CÁLCULO DE FRETE");
  console.log("=================================");

  console.log({
    origem: ORIGIN,
    destino: cep,
    quantidade: quantity,
    pesoPorProduto: `${weight} kg`,
    pesoTotal: `${totalWeight} kg`,
    dimensoes: {
      height,
      width,
      length
    }
  });

  console.log("Payload enviado:");
  console.log(
    JSON.stringify(payload, null, 2)
  );

  // ===================================================
  // SUPERFRETE
  // ===================================================

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

  const responseText =
    await response.text();

  console.log(
    "HTTP SuperFrete:",
    response.status
  );

  console.log(
    "Resposta SuperFrete:"
  );

  console.log(responseText);

  let data;

  try {
    data = JSON.parse(responseText);
  } catch {
    data = {
      raw: responseText
    };
  }

  // ===================================================
  // ERRO
  // ===================================================

  if (!response.ok) {
    console.error(
      "Erro SuperFrete:",
      response.status,
      data
    );

    let message =
      data?.message ||
      data?.error ||
      data?.errors?.[0]?.message ||
      data?.errors?.[0] ||
      data?.detail ||
      data?.details ||
      `SuperFrete retornou HTTP ${response.status}.`;

    if (typeof message !== "string") {
      message = JSON.stringify(message);
    }

    throw new Error(message);
  }

  // ===================================================
  // LOCALIZAR SERVIÇOS
  // ===================================================

  let raw = [];

  if (Array.isArray(data)) {
    raw = data;
  } else if (Array.isArray(data?.services)) {
    raw = data.services;
  } else if (Array.isArray(data?.rates)) {
    raw = data.rates;
  } else if (Array.isArray(data?.data)) {
    raw = data.data;
  } else if (Array.isArray(data?.results)) {
    raw = data.results;
  }

  // ===================================================
  // NORMALIZAR
  // ===================================================

  const rates = raw
    .map(normalize)
    .filter(rate => rate.price > 0)
    .sort(
      (a, b) => a.price - b.price
    );

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
// SERVIR SITE
// =====================================================

function serveStatic(req, res) {
  let requestedPath =
    req.url.split("?")[0];

  if (requestedPath === "/") {
    requestedPath = "/index.html";
  }

  const safePath = path
    .normalize(requestedPath)
    .replace(
      /^(\.\.[\/\\])+/,
      ""
    );

  const filePath = path.join(
    __dirname,
    safePath
  );

  if (
    !filePath.startsWith(__dirname)
  ) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  fs.readFile(
    filePath,
    (error, data) => {
      if (error) {
        res.writeHead(404, {
          "Content-Type":
            "text/plain; charset=utf-8"
        });

        return res.end(
          "Arquivo não encontrado."
        );
      }

      const extension =
        path
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
    }
  );
}

// =====================================================
// SERVIDOR
// =====================================================

const server = http.createServer(
  async (req, res) => {
    try {

      // CORS
      if (req.method === "OPTIONS") {
        res.writeHead(204, {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods":
            "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers":
            "Content-Type",
          "Access-Control-Max-Age":
            "86400"
        });

        return res.end();
      }

      // API FRETE
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

      // HEALTH
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
              ),

            originCep: ORIGIN,

            defaultProductWeight:
              "0.5 kg"
          }
        );
      }

      // SITE
      if (req.method === "GET") {
        return serveStatic(
          req,
          res
        );
      }

      return send(
        res,
        404,
        {
          error:
            "Rota não encontrada."
        }
      );

    } catch (error) {

      console.error(
        "================================="
      );

      console.error(
        "ERRO NO SERVIDOR:"
      );

      console.error(error);

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
// =====================================================

server.listen(
  PORT,
  HOST,
  () => {

    console.log("");
    console.log(
      "================================="
    );

    console.log(
      `WJ Imports rodando em ${HOST}:${PORT}`
    );

    console.log(
      `SuperFrete: ${
        TOKEN
          ? "configurado"
          : "AUSENTE"
      }`
    );

    console.log(
      `CEP origem: ${
        ORIGIN || "AUSENTE"
      }`
    );

    console.log(
      "Peso padrão por produto: 500 g"
    );

    console.log(
      "================================="
    );
  }
);