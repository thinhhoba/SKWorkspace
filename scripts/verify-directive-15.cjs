#!/usr/bin/env node
// scripts/verify-directive-15.cjs — Quality Gate cho Chỉ thị 15
const { execSync } = require("child_process");
const crypto = require("crypto");

let pass = 0, fail = 0;
function ok(name) { pass++; console.log(`  PASS  ${name}`); }
function ng(name, msg) { fail++; console.log(`  FAIL  ${name} — ${msg}`); }
function section(t) { console.log(`\n[ ${t} ]`); }

// 1. tsc --noEmit
section("1. tsc --noEmit");
try { execSync("npx tsc --noEmit", { stdio: "pipe", timeout: 120000 }); ok("tsc --noEmit"); }
catch (e) { ng("tsc --noEmit", (e.stdout||e.stderr||e.message||"").toString().slice(0,1200)); }

// 2. Alias format SK-WEB/POS/QA/DL
section("2. Alias SK-WEB/POS/QA/DL");
try {
  require("tsx/cjs");
  const mod = require("../packages/core/aliases.ts");
  const { generateBusinessCode, channelToScope, identifyBusinessScope } = mod;
  const d = new Date("2026-10-10T00:00:00Z");
  const cases = [
    ["SALES_WEB", "SK-WEB-261010-0001"],
    ["SALES_POS", "SK-POS-261010-0002"],
    ["SALES_QUAN_AN", "SK-QA-261010-0003"],
    ["SALES_DAI_LY", "SK-DL-261010-0004"],
  ];
  for (const [scope, expected] of cases) {
    const seq = parseInt(expected.slice(-4),10);
    const got = generateBusinessCode(scope, seq, d);
    if (got === expected) ok(`alias ${scope} -> ${got}`); else ng(`alias ${scope}`, `expected ${expected} got ${got}`);
  }
  // channelToScope
  if (channelToScope("web_order")==="SALES_WEB") ok("channelToScope web_order"); else ng("channelToScope web_order","mismatch");
  if (channelToScope("pos")==="SALES_POS") ok("channelToScope pos"); else ng("channelToScope pos","mismatch");
  if (identifyBusinessScope("SK-WEB-261010-0001")==="SALES_WEB") ok("identify SK-WEB"); else ng("identify SK-WEB","mismatch");
} catch (e) { ng("alias", e.message.slice(0,600)); }

// 3. Webhook HMAC verify
section("3. Webhook HMAC verify (Sapo)");
try {
  require("tsx/cjs");
  const { verifySapoWebhook, signPayload } = require("../packages/integrations/sapo/webhookService.ts");
  const raw = JSON.stringify({ id: 123, order_number: "SK-WEB-261010-0001" });
  const sig = signPayload(raw);
  if (verifySapoWebhook(raw, sig)) ok("HMAC valid passes"); else ng("HMAC valid", "should be true");
  if (!verifySapoWebhook(raw, sig + "x")) ok("HMAC invalid fails"); else ng("HMAC invalid", "should be false");
  if (!verifySapoWebhook(raw, "")) ok("HMAC empty fails"); else ng("HMAC empty","should be false");
} catch (e) { ng("webhook HMAC", e.message.slice(0,800)); }

// 4. VietQR idempotency
section("4. VietQR idempotency");
try {
  require("tsx/cjs");
  const { autoReconcileVietQr, isVietQrTxProcessed, __resetFinanceStore } = require("../packages/modules/finance/financeService.ts");
  __resetFinanceStore();
  const t1 = autoReconcileVietQr("SK-WEB-261010-0001", 500000, "test", "tx-001");
  const t2 = autoReconcileVietQr("SK-WEB-261010-0001", 500000, "test", "tx-001");
  if (t1.code === t2.code) ok("VietQR idempotency same code"); else ng("VietQR idempotency", `${t1.code} vs ${t2.code}`);
  if (isVietQrTxProcessed("tx-001")) ok("isVietQrTxProcessed true"); else ng("isVietQrTxProcessed","should be true");
  if (!isVietQrTxProcessed("tx-999")) ok("isVietQrTxProcessed false for unknown"); else ng("isVietQrTxProcessed unknown","should be false");
  __resetFinanceStore();
} catch (e) { ng("VietQR idempotency", e.message.slice(0,800)); }

// 5. Telemetry alert > -15C
section("5. Telemetry alert > -15C");
try {
  require("tsx/cjs");
  const { evaluateTelemetry } = require("../packages/modules/fleet/telemetryService.ts");
  const a1 = evaluateTelemetry(-10, "CLOSED", null);
  if (a1.includes("WARNING_HIGH_TEMP")) ok("temp -10 triggers HIGH_TEMP"); else ng("temp -10","should alert");
  const a2 = evaluateTelemetry(-18, "CLOSED", null);
  if (!a2.includes("WARNING_HIGH_TEMP")) ok("temp -18 no alert"); else ng("temp -18","should not alert");
  const a3 = evaluateTelemetry(-18, "OPEN", new Date(Date.now()-11*60*1000).toISOString());
  if (a3.includes("WARNING_DOOR_OPEN")) ok("door open >10m triggers"); else ng("door open >10m","should alert");
  const a4 = evaluateTelemetry(-18, "OPEN", new Date().toISOString());
  if (!a4.includes("WARNING_DOOR_OPEN")) ok("door open <10m no alert"); else ng("door open <10m","should not alert");
} catch (e) { ng("telemetry", e.message.slice(0,800)); }

// 6. EOD cron CRON_SECRET
section("6. EOD cron CRON_SECRET");
try {
  const src = require("fs").readFileSync("app/api/sapo/cron/eod-accounting/route.ts","utf8");
  if (src.includes("CRON_SECRET") && src.includes("x-cron-secret")) ok("EOD cron checks CRON_SECRET"); else ng("EOD cron","missing CRON_SECRET check");
} catch (e) { ng("EOD cron", e.message); }

// 7. RBAC canAccess for 4 roles
section("7. RBAC canAccess 4 roles");
try {
  require("tsx/cjs");
  const { canAccess, canAccessRoute, getAllowedRoutes } = require("../packages/core/rbac.ts");
  // admin all
  if (canAccess("ADMIN","finance")) ok("ADMIN can finance"); else ng("ADMIN finance","should be true");
  if (canAccess("ADMIN","pricing:edit")) ok("ADMIN can pricing:edit"); else ng("ADMIN pricing:edit","should be true");
  // ke_toan
  if (canAccess("ACCOUNTANT","finance")) ok("ACCOUNTANT can finance"); else ng("ACCOUNTANT finance","should be true");
  if (canAccess("ACCOUNTANT","reports")) ok("ACCOUNTANT can reports"); else ng("ACCOUNTANT reports","should be true");
  if (!canAccess("ACCOUNTANT","inventory:edit")) ok("ACCOUNTANT cannot inventory:edit (zero-leak)"); else ng("ACCOUNTANT inventory:edit","should be false");
  if (!canAccess("ACCOUNTANT","fleet:view")) ok("ACCOUNTANT cannot fleet:view"); else ng("ACCOUNTANT fleet:view","should be false (unless allowed)");
  // thu_kho
  if (canAccess("WAREHOUSE","sales:pick")) ok("WAREHOUSE can sales:pick"); else ng("WAREHOUSE sales:pick","should be true");
  if (canAccess("WAREHOUSE","inventory:view")) ok("WAREHOUSE can inventory"); else ng("WAREHOUSE inventory","should be true");
  if (canAccess("WAREHOUSE","fleet:view")) ok("WAREHOUSE can fleet:view"); else ng("WAREHOUSE fleet:view","should be true");
  if (!canAccess("WAREHOUSE","finance")) ok("WAREHOUSE cannot finance (zero-leak)"); else ng("WAREHOUSE finance","should be false");
  if (!canAccess("WAREHOUSE","pricing:edit")) ok("WAREHOUSE cannot pricing:edit"); else ng("WAREHOUSE pricing:edit","should be false");
  // tai_xe
  if (canAccess("DRIVER","pwa:giaovan")) ok("DRIVER can pwa:giaovan"); else ng("DRIVER pwa:giaovan","should be true");
  if (canAccess("DRIVER","delivery:update")) ok("DRIVER can delivery:update"); else ng("DRIVER delivery:update","should be true");
  if (canAccess("DRIVER","fleet:view")) ok("DRIVER can fleet:view"); else ng("DRIVER fleet:view","should be true");
  if (!canAccess("DRIVER","finance")) ok("DRIVER cannot finance (zero-leak)"); else ng("DRIVER finance","should be false");
  if (!canAccess("DRIVER","sales:pick")) ok("DRIVER cannot sales:pick"); else ng("DRIVER sales:pick","should be false");
  if (!canAccess("DRIVER","pricing:view")) ok("DRIVER cannot pricing:view"); else ng("DRIVER pricing:view","should be false");
  // canAccessRoute
  if (!canAccessRoute("DRIVER","/finance")) ok("DRIVER cannot route /finance"); else ng("DRIVER /finance route","should be false");
  if (!canAccessRoute("WAREHOUSE","/finance/sapo2misa")) ok("WAREHOUSE cannot /finance/sapo2misa"); else ng("WAREHOUSE /finance/sapo2misa","should be false");
  if (canAccessRoute("ACCOUNTANT","/finance")) ok("ACCOUNTANT can route /finance"); else ng("ACCOUNTANT /finance route","should be true");
  if (canAccessRoute("DRIVER","/pwa/giaovan")) ok("DRIVER can route /pwa/giaovan"); else ng("DRIVER /pwa/giaovan","should be true");
  // getAllowedRoutes sanity
  const dr = getAllowedRoutes("DRIVER");
  if (!dr.includes("/finance") && dr.includes("/pwa/giaovan")) ok("getAllowedRoutes DRIVER zero-leak"); else ng("getAllowedRoutes DRIVER", JSON.stringify(dr));
} catch (e) { ng("RBAC", e.message.slice(0,1200) + "\n" + (e.stack||"").slice(0,1200)); }

console.log(`\n=== RESULT: ${pass} pass, ${fail} fail ===`);
process.exit(fail ? 1 : 0);
