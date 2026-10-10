const http = require("http");

function fetchUrl(path, method = "GET", body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const reqHeaders = {
      ...headers,
      ...(data ? { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(data) } : {}),
      "Cookie": "sk_session=mock.jwt.token",
    };

    const req = http.request(
      {
        hostname: "127.0.0.1",
        port: 3000,
        path,
        method,
        headers: reqHeaders,
      },
      (res) => {
        let respData = "";
        res.on("data", (chunk) => (respData += chunk));
        res.on("end", () => {
          try {
            resolve({ statusCode: res.statusCode, data: JSON.parse(respData) });
          } catch (e) {
            resolve({ statusCode: res.statusCode, raw: respData });
          }
        });
      }
    );

    req.on("error", reject);
    if (data) req.write(data);
    req.end();
  });
}

async function run() {
  console.log("=== KIỂM THỬ THỰC TẾ CÁC ENDPOINT CHỈ THỊ 14 ===\n");

  // 1. Health
  try {
    const r1 = await fetchUrl("/api/health");
    console.log("[1] GET /api/health -> HTTP", r1.statusCode, JSON.stringify(r1.data));
  } catch (e) {
    console.log("[1] GET /api/health -> ERR", e.message);
  }

  // 2. Pricing
  try {
    const r2 = await fetchUrl("/api/pricing");
    console.log("[2] GET /api/pricing -> HTTP", r2.statusCode, "count:", r2.data?.count, "stats:", JSON.stringify(r2.data?.stats));
  } catch (e) {
    console.log("[2] GET /api/pricing -> ERR", e.message);
  }

  // 3. Pricing Quote
  try {
    const r3 = await fetchUrl("/api/pricing/quote", "POST", { channel: "dai_ly" });
    console.log("[3] POST /api/pricing/quote -> HTTP", r3.statusCode, "channel:", r3.data?.channel, "preview:", r3.data?.text?.slice(0, 100).replace(/\n/g, " "));
  } catch (e) {
    console.log("[3] POST /api/pricing/quote -> ERR", e.message);
  }

  // 4. Sapo Products
  try {
    const r4 = await fetchUrl("/api/sapo/products?limit=5");
    console.log("[4] GET /api/sapo/products -> HTTP", r4.statusCode, "count:", r4.data?.count, "sample:", r4.data?.products?.[0]?.name);
  } catch (e) {
    console.log("[4] GET /api/sapo/products -> ERR", e.message);
  }

  // 5. AMIS Open API
  try {
    const r5 = await fetchUrl("/api/sapo2misa/amis", "POST", {
      orders: [
        {
          id: 13537,
          alias_code: "SK-QA-261010-0001",
          order_code: "13537",
          customer_name: "Quán Ăn Cô Ba Cầu Giấy",
          total_price: 1850000,
          channel: "quan_an",
          items: [{ sku: "HH053", name: "Gà Popcorn CP 1kg", quantity: 10, unit_price: 117000 }]
        }
      ]
    });
    console.log("[5] POST /api/sapo2misa/amis -> HTTP", r5.statusCode, "result:", JSON.stringify(r5.data?.vouchers?.[0] || r5.data));
  } catch (e) {
    console.log("[5] POST /api/sapo2misa/amis -> ERR", e.message);
  }

  // 6. meInvoice Bot OpenAPI
  try {
    const r6 = await fetchUrl("/api/sapo2misa/meinvoice", "POST", {
      orders: [
        {
          id: 13537,
          alias_code: "SK-QA-261010-0001",
          order_code: "13537",
          customer_name: "Quán Ăn Cô Ba Cầu Giấy",
          total_price: 1850000,
          channel: "quan_an",
          items: [{ sku: "HH053", name: "Gà Popcorn CP 1kg", quantity: 10, unit_price: 117000 }]
        }
      ]
    });
    console.log("[6] POST /api/sapo2misa/meinvoice -> HTTP", r6.statusCode, "result:", JSON.stringify(r6.data?.invoices?.[0] || r6.data));
  } catch (e) {
    console.log("[6] POST /api/sapo2misa/meinvoice -> ERR", e.message);
  }

  console.log("\n=== HOÀN TẤT THỬ NGHIỆM ===");
}

run();
