#!/usr/bin/env node
/**
 * SK Workspace - Local AI Gateway Proxy with Smart Prompt Caching & Auto-Failover
 * Zero external dependencies. Works on Node 18+ (Node 24 native).
 * 
 * Features:
 *   ⚡ Auto Anthropic Prompt Caching injection (saves up to 90% input cost)
 *   🔄 Load balancing (Round-Robin) & Auto-failover on 429/524/5xx
 *   🛡️ Quota protection: Tracks daily limits ($150/day reset at 07:00 VN)
 *   💾 In-memory cache for models & deterministic read queries
 *   📊 Real-time telemetry dashboard at http://localhost:3001/stats
 * 
 * Usage:
 *   node scripts/gateway-proxy.mjs
 */

import http from 'node:http';
import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.resolve(__dirname, 'proxy-config.json');

// Global configuration
let config = {
  port: 3001,
  host: '127.0.0.1',
  target: 'https://1gw.gwai.cloud',
  timeoutMs: 100000,
  strategy: 'round-robin', // 'round-robin' | 'fallback'
  enablePromptCaching: true,
  enableLocalResponseCache: true,
  keys: []
};

// Key state tracking (quota, rate-limits, error cooldowns)
const keyStates = new Map();

// Telemetry & stats tracking
const telemetry = {
  startedAt: new Date(),
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  cacheHits: 0,
  cacheWrites: 0,
  tokensCachedRead: 0,
  tokensCachedWritten: 0,
  tokensInputUncached: 0,
  tokensOutput: 0,
  get tokensSavedTotal() {
    return this.tokensCachedRead;
  },
  get estimatedUsdSaved() {
    // Anthropic Sonnet input: $3/Mtok vs Cache Read: $0.30/Mtok => $2.70 saved per 1M cached tokens
    return (this.tokensCachedRead / 1_000_000) * 2.70;
  },
  get estimatedVndSaved() {
    return Math.round(this.estimatedUsdSaved * 26000);
  }
};

// In-memory cache for deterministic endpoints (e.g. /v1/models)
const localCache = new Map();

function loadConfig() {
  if (fs.existsSync(CONFIG_PATH)) {
    try {
      const raw = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
      config = { ...config, ...raw };
    } catch (err) {
      console.error('[CONFIG ERROR] Failed to parse proxy-config.json:', err.message);
    }
  } else {
    const envKeys = process.env.GW_KEYS || process.env.ANTHROPIC_API_KEYS;
    if (envKeys) {
      config.keys = envKeys.split(',').map(k => k.trim()).filter(Boolean);
    }
  }

  // Initialize key states
  for (const k of config.keys) {
    if (!keyStates.has(k)) {
      keyStates.set(k, {
        totalRequests: 0,
        consecutiveErrors: 0,
        quotaExceededUntil: null,
        cooldownUntil: null
      });
    }
  }
}

// Initial config load & hot-reload watcher
loadConfig();
if (fs.existsSync(CONFIG_PATH)) {
  fs.watch(CONFIG_PATH, (eventType) => {
    if (eventType === 'change') {
      try {
        loadConfig();
        log('OK', `🔄 [HOT RELOAD] Đã nạp lại proxy-config.json! Hiện có ${config.keys.length} API keys khả dụng.`);
      } catch (err) {
        log('WARN', `Lỗi khi reload config: ${err.message}`);
      }
    }
  });
}

let keyIndex = 0;

function getTimestamp() {
  const d = new Date();
  return d.toTimeString().split(' ')[0];
}

function log(level, msg) {
  const ts = getTimestamp();
  const colors = {
    INFO: '\x1b[36m',
    OK: '\x1b[32m',
    WARN: '\x1b[33m',
    ERR: '\x1b[31m',
    CACHE: '\x1b[35m',
    RESET: '\x1b[0m'
  };
  const color = colors[level] || colors.INFO;
  console.log(`[${ts}] ${color}[${level}]${colors.RESET} ${msg}`);
}

function maskKey(key) {
  if (!key || key.length < 10) return '***';
  return `${key.slice(0, 6)}...${key.slice(-4)}`;
}

/**
 * Counts existing cache_control breakpoints in Anthropic request body
 */
function countExistingCacheControls(bodyObj) {
  let count = 0;
  if (!bodyObj || typeof bodyObj !== 'object') return 0;

  if (Array.isArray(bodyObj.system)) {
    for (const b of bodyObj.system) {
      if (b && typeof b === 'object' && b.cache_control) count++;
    }
  }
  if (Array.isArray(bodyObj.tools)) {
    for (const t of bodyObj.tools) {
      if (t && typeof t === 'object' && t.cache_control) count++;
    }
  }
  if (Array.isArray(bodyObj.messages)) {
    for (const m of bodyObj.messages) {
      if (Array.isArray(m.content)) {
        for (const c of m.content) {
          if (c && typeof c === 'object' && c.cache_control) count++;
        }
      } else if (m && typeof m === 'object' && m.cache_control) {
        count++;
      }
    }
  }
  return count;
}

/**
 * Injects Anthropic Prompt Caching breakpoints into request body (up to 4 allowed)
 */
function injectPromptCaching(bodyObj) {
  if (!bodyObj || typeof bodyObj !== 'object') return { modified: false, count: 0 };

  let currentCount = countExistingCacheControls(bodyObj);
  const MAX_BREAKPOINTS = 4;
  let injected = 0;

  // 1. Breakpoint on System Prompt (highest reuse across session)
  if (currentCount < MAX_BREAKPOINTS && bodyObj.system) {
    if (typeof bodyObj.system === 'string' && bodyObj.system.trim().length > 0) {
      bodyObj.system = [
        {
          type: 'text',
          text: bodyObj.system,
          cache_control: { type: 'ephemeral' }
        }
      ];
      currentCount++;
      injected++;
    } else if (Array.isArray(bodyObj.system) && bodyObj.system.length > 0) {
      const lastBlock = bodyObj.system[bodyObj.system.length - 1];
      if (lastBlock && typeof lastBlock === 'object' && !lastBlock.cache_control) {
        lastBlock.cache_control = { type: 'ephemeral' };
        currentCount++;
        injected++;
      }
    }
  }

  // 2. Breakpoint on Tools (tools list can be 10k-20k tokens in Claude Code)
  if (currentCount < MAX_BREAKPOINTS && Array.isArray(bodyObj.tools) && bodyObj.tools.length > 0) {
    const hasToolCache = bodyObj.tools.some(t => t && t.cache_control);
    if (!hasToolCache) {
      const lastTool = bodyObj.tools[bodyObj.tools.length - 1];
      if (lastTool && typeof lastTool === 'object') {
        lastTool.cache_control = { type: 'ephemeral' };
        currentCount++;
        injected++;
      }
    }
  }

  // 3. Breakpoint on Conversation Turns (Rolling Turn Caching)
  if (currentCount < MAX_BREAKPOINTS && Array.isArray(bodyObj.messages) && bodyObj.messages.length >= 2) {
    // Put cache breakpoint on 2nd-to-last turn (fixed prefix that will be reused next turn)
    const targetIdx = bodyObj.messages.length - 2;
    const targetMsg = bodyObj.messages[targetIdx];

    if (targetMsg) {
      if (typeof targetMsg.content === 'string') {
        targetMsg.content = [
          {
            type: 'text',
            text: targetMsg.content,
            cache_control: { type: 'ephemeral' }
          }
        ];
        currentCount++;
        injected++;
      } else if (Array.isArray(targetMsg.content) && targetMsg.content.length > 0) {
        const lastContent = targetMsg.content[targetMsg.content.length - 1];
        if (lastContent && typeof lastContent === 'object' && !lastContent.cache_control) {
          lastContent.cache_control = { type: 'ephemeral' };
          currentCount++;
          injected++;
        }
      }
    }
  }

  return { modified: injected > 0, count: currentCount, injected };
}

/**
 * Inspects streaming / non-streaming response body chunks for token usage & cache metrics
 */
function recordUsageTelemetry(text) {
  if (!text) return;

  const readMatch = text.match(/"cache_read_input_tokens"\s*:\s*(\d+)/);
  const writeMatch = text.match(/"cache_creation_input_tokens"\s*:\s*(\d+)/);
  const inputMatch = text.match(/"input_tokens"\s*:\s*(\d+)/);
  const outputMatch = text.match(/"output_tokens"\s*:\s*(\d+)/);

  if (readMatch) {
    const tokens = parseInt(readMatch[1], 10);
    if (tokens > 0) {
      telemetry.tokensCachedRead += tokens;
      telemetry.cacheHits++;
      log('CACHE', `⚡ [CACHE HIT] Đọc ${tokens.toLocaleString()} tokens từ cache (Tiết kiệm ~90% cost!)`);
    }
  }

  if (writeMatch) {
    const tokens = parseInt(writeMatch[1], 10);
    if (tokens > 0) {
      telemetry.tokensCachedWritten += tokens;
      telemetry.cacheWrites++;
      log('CACHE', `💾 [CACHE WRITE] Ghi ${tokens.toLocaleString()} tokens vào Anthropic cache.`);
    }
  }

  if (inputMatch) {
    const tokens = parseInt(inputMatch[1], 10);
    if (tokens > 0) {
      telemetry.tokensInputUncached += tokens;
    }
  }

  if (outputMatch) {
    const tokens = parseInt(outputMatch[1], 10);
    if (tokens > 0) {
      telemetry.tokensOutput += tokens;
    }
  }
}

/**
 * Forward request to upstream target
 */
function forwardUpstream(req, reqBody, key) {
  return new Promise((resolve, reject) => {
    const cleanPath = req.url.replace(/^\/v1\/v1/, '/v1');
    const targetUrl = new URL(cleanPath, config.target);
    const isHttps = targetUrl.protocol === 'https:';
    const client = isHttps ? https : http;

    const headers = { ...req.headers };
    headers['host'] = targetUrl.host;

    // Inject Anthropic Prompt Caching Beta Header
    if (config.enablePromptCaching) {
      const existingBeta = headers['anthropic-beta'] || '';
      if (!existingBeta) {
        headers['anthropic-beta'] = 'prompt-caching-2024-07-31';
      } else if (!existingBeta.includes('prompt-caching-2024-07-31')) {
        headers['anthropic-beta'] = `${existingBeta},prompt-caching-2024-07-31`;
      }
    }

    // Inject API key
    if (key) {
      if (headers['x-api-key'] || req.url.includes('/messages')) {
        headers['x-api-key'] = key;
      }
      if (headers['authorization'] || !headers['x-api-key']) {
        headers['authorization'] = `Bearer ${key}`;
      }
    }

    // Remove hop-by-hop headers and conflicting length headers
    delete headers['connection'];
    delete headers['transfer-encoding'];
    delete headers['keep-alive'];
    delete headers['content-length'];
    if (reqBody && reqBody.length > 0) {
      headers['content-length'] = Buffer.byteLength(reqBody);
    }

    const options = {
      protocol: targetUrl.protocol,
      hostname: targetUrl.hostname,
      port: targetUrl.port || (isHttps ? 443 : 80),
      path: targetUrl.pathname + targetUrl.search,
      method: req.method,
      headers: headers,
      timeout: config.timeoutMs
    };

    const upstreamReq = client.request(options, (upstreamRes) => {
      resolve({ upstreamRes, key });
    });

    upstreamReq.on('timeout', () => {
      upstreamReq.destroy(new Error(`Upstream timed out after ${config.timeoutMs}ms`));
    });

    upstreamReq.on('error', (err) => {
      reject(err);
    });

    if (reqBody && reqBody.length > 0) {
      upstreamReq.write(reqBody);
    }
    upstreamReq.end();
  });
}

/**
 * Renders HTML Stats & Telemetry Dashboard
 */
function renderHtmlDashboard() {
  const uptimeMinutes = Math.round((Date.now() - telemetry.startedAt.getTime()) / 60000);
  const totalCached = telemetry.tokensCachedRead.toLocaleString();
  const totalWritten = telemetry.tokensCachedWritten.toLocaleString();
  const totalUncached = telemetry.tokensInputUncached.toLocaleString();
  const totalOutput = telemetry.tokensOutput.toLocaleString();
  const usdSaved = telemetry.estimatedUsdSaved.toFixed(3);
  const vndSaved = telemetry.estimatedVndSaved.toLocaleString();

  const totalInputs = telemetry.tokensCachedRead + telemetry.tokensInputUncached;
  const hitRate = totalInputs > 0 ? ((telemetry.tokensCachedRead / totalInputs) * 100).toFixed(1) : '0.0';

  const keysHtml = config.keys.map((k, idx) => {
    const st = keyStates.get(k) || {};
    const isQuotaExceeded = st.quotaExceededUntil && st.quotaExceededUntil > Date.now();
    const statusBadge = isQuotaExceeded
      ? `<span style="background: #ef4444; color: white; padding: 2px 8px; border-radius: 4px;">Hết hạn mức ngày ($150) - Reset 07:00 VN</span>`
      : `<span style="background: #22c55e; color: white; padding: 2px 8px; border-radius: 4px;">Sẵn sàng hoạt động</span>`;

    return `
      <tr style="border-bottom: 1px solid #334155;">
        <td style="padding: 10px 14px; font-weight: 600;">Key #${idx + 1}</td>
        <td style="padding: 10px 14px; font-family: monospace;">${maskKey(k)}</td>
        <td style="padding: 10px 14px;">${statusBadge}</td>
        <td style="padding: 10px 14px;">${st.totalRequests || 0}</td>
      </tr>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <title>SK Workspace - AI Gateway Cache Telemetry</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 24px; }
        .container { max-width: 900px; margin: 0 auto; }
        .card { background: #1e293b; border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid #334155; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
        .stat-box { background: #0f172a; border-radius: 8px; padding: 16px; border: 1px solid #334155; text-align: center; }
        .stat-value { font-size: 26px; font-weight: 700; color: #38bdf8; margin: 8px 0; }
        .stat-label { font-size: 13px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
        .green { color: #4ade80 !important; }
        .purple { color: #c084fc !important; }
        table { width: 100%; border-collapse: collapse; text-align: left; }
        th { padding: 10px 14px; background: #0f172a; color: #94a3b8; font-weight: 600; font-size: 13px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1 style="margin-top: 0; display: flex; align-items: center; gap: 10px;">
          ⚡ SK Workspace AI Gateway Proxy
          <span style="font-size: 14px; background: #0284c7; color: white; padding: 4px 10px; border-radius: 20px;">Port ${config.port}</span>
        </h1>
        <p style="color: #94a3b8; margin-top: -6px;">Hệ thống Caching Tự Động & Cân Bằng Tải Anthropic Claude</p>

        <div class="grid" style="margin-bottom: 20px;">
          <div class="stat-box">
            <div class="stat-label">Tiết kiệm ước tính</div>
            <div class="stat-value green">${vndSaved} đ</div>
            <div style="font-size: 12px; color: #64748b;">$${usdSaved} USD</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Cache Hit Rate</div>
            <div class="stat-value purple">${hitRate}%</div>
            <div style="font-size: 12px; color: #64748b;">${telemetry.cacheHits} Hits / ${telemetry.cacheWrites} Writes</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Tokens đọc từ Cache</div>
            <div class="stat-value">${totalCached}</div>
            <div style="font-size: 12px; color: #64748b;">Giảm 90% giá mua</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Tổng số Requests</div>
            <div class="stat-value">${telemetry.totalRequests}</div>
            <div style="font-size: 12px; color: #64748b;">Uptime: ${uptimeMinutes} phút</div>
          </div>
        </div>

        <div class="card">
          <h3 style="margin-top: 0;">🔑 Trạng Thái Các API Keys (${config.keys.length} keys)</h3>
          <table>
            <thead>
              <tr>
                <th>Số thứ tự</th>
                <th>API Key</th>
                <th>Trạng thái</th>
                <th>Số yêu cầu đã gửi</th>
              </tr>
            </thead>
            <tbody>
              ${keysHtml}
            </tbody>
          </table>
        </div>

        <div class="card">
          <h3 style="margin-top: 0;">⚙️ Cấu Hình Hoạt Động</h3>
          <ul style="color: #cbd5e1; line-height: 1.8; margin-bottom: 0;">
            <li><b>Prompt Caching:</b> ${config.enablePromptCaching ? '✅ BẬT (Tự động inject cache_control vào System, Tools & Messages)' : '❌ TẮT'}</li>
            <li><b>Local Models Cache:</b> ${config.enableLocalResponseCache ? '✅ BẬT (Cache /v1/models 1 giờ trong RAM)' : '❌ TẮT'}</li>
            <li><b>Target Gateway:</b> <code>${config.target}</code></li>
            <li><b>Chính sách cân bằng:</b> <code>${config.strategy}</code></li>
            <li><b>Tự động đổi Key:</b> Khi lỗi 429 (Rate Limit) hoặc 524/504 (Cloudflare Timeout)</li>
          </ul>
        </div>
      </div>
    </body>
    </html>
  `;
}

const server = http.createServer(async (req, res) => {
  // Health & stats endpoints
  if (req.url === '/health' || req.url === '/_proxy_status') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      status: 'ok',
      promptCachingEnabled: config.enablePromptCaching,
      keysConfigured: config.keys.length,
      keys: config.keys.map(maskKey),
      target: config.target,
      telemetry: {
        totalRequests: telemetry.totalRequests,
        cacheHits: telemetry.cacheHits,
        cacheWrites: telemetry.cacheWrites,
        tokensCachedRead: telemetry.tokensCachedRead,
        tokensCachedWritten: telemetry.tokensCachedWritten,
        estimatedUsdSaved: telemetry.estimatedUsdSaved,
        estimatedVndSaved: telemetry.estimatedVndSaved
      }
    }, null, 2));
    return;
  }

  if (req.url === '/stats' || req.url === '/dashboard') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(renderHtmlDashboard());
    return;
  }

  if (req.url === '/stats.json') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(telemetry, null, 2));
    return;
  }

  // Local caching for GET /v1/models (reduces unnecessary API calls)
  if (config.enableLocalResponseCache && req.method === 'GET' && (req.url === '/v1/models' || req.url === '/models')) {
    const cachedModels = localCache.get('models');
    if (cachedModels && (Date.now() - cachedModels.timestamp < 3600000)) { // 1 hour TTL
      log('CACHE', '⚡ [LOCAL HIT] Trả về danh sách models từ bộ nhớ đệm (RAM)');
      res.writeHead(cachedModels.status, {
        ...cachedModels.headers,
        'x-local-cache': 'HIT'
      });
      res.end(cachedModels.body);
      return;
    }
  }

  // Collect request body
  const chunks = [];
  req.on('data', chunk => chunks.push(chunk));
  req.on('end', async () => {
    let reqBody = Buffer.concat(chunks);
    loadConfig();
    telemetry.totalRequests++;

    const availableKeys = config.keys.filter(k => k && !k.includes('DÁN_KEY'));
    if (availableKeys.length === 0) {
      log('ERR', `Chưa có API key hợp lệ trong file ${CONFIG_PATH}!`);
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({
        error: 'Proxy: Chưa cấu hình API key trong scripts/proxy-config.json'
      }));
      return;
    }

    // Smart Prompt Caching Injection
    let promptCacheInfo = null;
    const isMessagesPost = req.method === 'POST' && (req.url.includes('/messages'));
    if (config.enablePromptCaching && isMessagesPost && reqBody.length > 0) {
      try {
        const bodyObj = JSON.parse(reqBody.toString('utf-8'));
        promptCacheInfo = injectPromptCaching(bodyObj);
        if (promptCacheInfo.modified) {
          reqBody = Buffer.from(JSON.stringify(bodyObj), 'utf-8');
          log('CACHE', `⚡ [AUTO CACHE] Đã gắn ${promptCacheInfo.injected} cache breakpoints vào request payload (Tổng: ${promptCacheInfo.count}/4)`);
        }
      } catch (err) {
        // Body was not JSON or parse error, forward as is
      }
    }

    // Filter out keys currently marked as QUOTA_EXCEEDED
    const now = Date.now();
    const activeKeys = availableKeys.filter(k => {
      const st = keyStates.get(k);
      return !st?.quotaExceededUntil || st.quotaExceededUntil <= now;
    });

    const candidateKeys = activeKeys.length > 0 ? activeKeys : availableKeys;

    let selectedIdx = config.strategy === 'round-robin'
      ? (keyIndex++) % candidateKeys.length
      : 0;

    let attempts = 0;
    let lastError = null;

    // Retry loop across keys
    while (attempts < candidateKeys.length) {
      const currentKey = candidateKeys[(selectedIdx + attempts) % candidateKeys.length];
      const keyLabel = `Key #${availableKeys.indexOf(currentKey) + 1} (${maskKey(currentKey)})`;
      const keyState = keyStates.get(currentKey) || {};

      log('INFO', `${req.method} ${req.url} -> Gửi qua ${keyLabel} (Lần thử ${attempts + 1}/${candidateKeys.length})`);

      try {
        const { upstreamRes } = await forwardUpstream(req, reqBody, currentKey);
        const status = upstreamRes.statusCode;

        // Check for Quota Limit (429 cost_limit_exceeded)
        if (status === 429) {
          // Read response to inspect error type
          const errChunks = [];
          for await (const chunk of upstreamRes) {
            errChunks.push(chunk);
          }
          const errBody = Buffer.concat(errChunks).toString('utf-8');

          if (errBody.includes('cost_limit_exceeded')) {
            // Mark this key as quota exceeded until 00:00:00 UTC (07:00 VN)
            const tomorrowUtc = new Date();
            tomorrowUtc.setUTCDate(tomorrowUtc.getUTCDate() + 1);
            tomorrowUtc.setUTCHours(0, 0, 0, 0);
            keyState.quotaExceededUntil = tomorrowUtc.getTime();

            log('WARN', `⚠️ [QUOTA] ${keyLabel} đã đạt hạn mức $150/ngày! Reset lúc 07:00 VN.`);

            if (attempts < candidateKeys.length - 1) {
              log('INFO', `Tự động chuyển tiếp sang Key khả dụng khác...`);
              attempts++;
              continue;
            } else {
              // All keys exhausted
              log('ERR', `⛔ [HẾT QUOTA TẤT CẢ KEYS] Tất cả các keys đều đã đạt hạn mức ngày!`);
              res.writeHead(429, { 'Content-Type': 'application/json; charset=utf-8' });
              res.end(JSON.stringify({
                error: {
                  code: 'all_keys_cost_limit_exceeded',
                  message: 'Tất cả các API key đều đã đạt hạn mức ngày ($150/ngày). Hạn mức sẽ tự động mở lại lúc 07:00 sáng mai (giờ VN).',
                  reset_at: tomorrowUtc.toISOString(),
                  advice: 'Bạn có thể dán thêm API key mới vào scripts/proxy-config.json để tiếp tục ngay lập tức.'
                }
              }));
              return;
            }
          }

          // Transient Rate Limit 429: wait 1.5s backoff and try next key
          if (attempts < candidateKeys.length - 1) {
            log('WARN', `${keyLabel} gặp Rate Limit (429)! Đang đổi sang Key tiếp theo sau 1.5s...`);
            await new Promise(r => setTimeout(r, 1500));
            attempts++;
            continue;
          }
        }

        // Check for 524, 502, 503, 504 gateway errors
        const isGatewayError = status === 524 || status === 502 || status === 503 || status === 504;
        if (isGatewayError && attempts < candidateKeys.length - 1) {
          log('WARN', `${keyLabel} trả về HTTP ${status}! Tự động đổi sang Key tiếp theo...`);
          upstreamRes.resume();
          attempts++;
          continue;
        }

        // Success / normal response
        telemetry.successfulRequests++;
        keyState.totalRequests = (keyState.totalRequests || 0) + 1;
        log(status < 400 ? 'OK' : 'WARN', `${keyLabel} phản hồi HTTP ${status}`);

        // Forward headers
        const resHeaders = { ...upstreamRes.headers };
        res.writeHead(status, resHeaders);

        // Intercept stream / response for usage & cache telemetry
        let responseBuffer = '';
        upstreamRes.on('data', (chunk) => {
          res.write(chunk);
          if (responseBuffer.length < 50000) {
            responseBuffer += chunk.toString('utf-8');
            recordUsageTelemetry(chunk.toString('utf-8'));
          }
        });

        upstreamRes.on('end', () => {
          res.end();
          recordUsageTelemetry(responseBuffer);

          // If this was GET /v1/models and status 200, cache it locally in memory
          if (config.enableLocalResponseCache && req.method === 'GET' && (req.url === '/v1/models' || req.url === '/models') && status === 200) {
            localCache.set('models', {
              status,
              headers: resHeaders,
              body: responseBuffer,
              timestamp: Date.now()
            });
            log('CACHE', '💾 [LOCAL CACHE] Đã lưu danh sách models vào bộ nhớ đệm (RAM)');
          }
        });

        return;

      } catch (err) {
        lastError = err;
        log('WARN', `${keyLabel} lỗi kết nối: ${err.message}. Đổi sang Key tiếp theo...`);
        attempts++;
      }
    }

    // All keys failed
    telemetry.failedRequests++;
    log('ERR', `Tất cả ${candidateKeys.length} keys đều thất bại! Lỗi cuối: ${lastError?.message}`);
    res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      error: 'Proxy: Tất cả API keys đều không phản hồi.',
      details: lastError?.message || 'Upstream timeout / error'
    }));
  });
});

server.listen(config.port, config.host, () => {
  console.log('\n=============================================================');
  console.log('   🚀 SK WORKSPACE AI GATEWAY PROXY (PROMPT CACHING READY)   ');
  console.log('=============================================================');
  log('OK', `Proxy đang chạy tại:        http://${config.host}:${config.port}`);
  log('CACHE', `Prompt Caching:             ${config.enablePromptCaching ? 'BẬT (Tiết kiệm tới 90% chi phí input)' : 'TẮT'}`);
  log('INFO', `Upstream Target:            ${config.target}`);
  log('INFO', `Số Keys cấu hình:           ${config.keys.filter(k => k && !k.includes('DÁN_KEY')).length} keys`);
  log('INFO', `Dashboard thống kê cache:   http://${config.host}:${config.port}/stats`);
  log('INFO', `File cấu hình:              ${CONFIG_PATH}`);
  console.log('-------------------------------------------------------------');
  console.log('👉 Base URL cho Claude Code / IDE:');
  console.log(`   http://localhost:${config.port}/v1`);
  console.log('=============================================================\n');
});
