const http = require("http");

const PORT = Number(process.env.PORT || 10000);
const HOST = "0.0.0.0";

const BASE = (
  process.env.SUPERFRETE_BASE_URL || "https://api.superfrete.com"
).replace(/\/$/, "");

const TOKEN = process.env.SUPERFRETE_TOKEN || "";

const ORIGIN = String(
  process.env.SUPERFRETE_ORIGIN_CEP || ""
).replace(/\D/g, "");

function send(res, status, data) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",

    // CORS — permite o GitHub Pages acessar o Render
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });

  res.end(JSON.stringify(data));
}

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
      null,

    name:
      rate?.name ??
      rate?.service ??
      rate?.service_name ??
      rate?.description ??
      "Envio",

    price: Number.isFinite(price) ? price : 0,

    deliveryTime:
      rate?.delivery_time ??
      rate?.deliveryTime ??
      rate?.deadline ??
      rate?.delivery_days ??
      rate?.deliveryDays ??
      rate?.days ??
      null
  };
}

async function calculate(body) {
  if (!TOKEN) {
    throw new Error(
      "SUPERFRETE_TOKEN não configurado no Render."
    );
  }

  if (ORIGIN.length !== 8) {
    throw new Error(
      "SUPERFRETE_ORIGIN_CEP não configurado corretamente no Render."
    );
  }

  const cep = String(body.cep || "").replace(/\D/g, "");

  if (cep.length !== 8) {
    throw new Error("CEP de destino inválido.");
  }

  const quantity = Math.max(
    1,
    Math.min(20, Number(body.quantity || 1))
  );

  const weight = Math.max(
    0.1,
    Number(body.weight || 0.3)
  );

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

  const text = await response.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    data = {
      raw: text
    };
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
      data?.error ||
      data?.errors?.[0]?.message ||
      `SuperFrete retornou HTTP ${response.status}.`
    );
  }

  const raw =
    Array.isArray(data)
      ? data
      : Array.isArray(data?.services)
        ? data.services
        : Array.isArray(data?.rates)
          ? data.rates
          : Array.isArray(data?.data)
            ? data.data
            : [];

  const rates = raw
    .map(normalize)
    .filter(rate => rate.price > 0)
    .sort((a, b) => a.price - b.price);

  return {
    rates
  };
}

const server = http.createServer(
  async (req, res) => {
    try {

      // CORS preflight
      if (req.method === "OPTIONS") {
        res.writeHead(204, {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400"
        });

        return res.end();
      }

      // API de cálculo
      if (
        req.method === "POST" &&
        req.url === "/api/frete"
      ) {
        const body = await readBody(req);

        const result = await calculate(body);

        return send(res, 200, result);
      }

      // Teste do servidor
      if (
        req.method === "GET" &&
        req.url === "/api/health"
      ) {
        return send(res, 200, {
          ok: true,
          superfreteConfigured:
            Boolean(TOKEN && ORIGIN.length === 8)
        });
      }

      return send(res, 404, {
        error: "Rota não encontrada."
      });

    } catch (error) {

      console.error(error);

      return send(res, 500, {
        error:
          error.message ||
          "Erro interno no servidor."
      });
    }
  }
);

server.listen(
  PORT,
  HOST,
  () => {
    console.log(
      `WJ Imports API rodando em ${HOST}:${PORT}`
    );

    console.log(
      `SuperFrete: ${
        TOKEN ? "configurado" : "ausente"
      }`
    );

    console.log(
      `CEP origem: ${
        ORIGIN || "ausente"
      }`
    );
  }
);