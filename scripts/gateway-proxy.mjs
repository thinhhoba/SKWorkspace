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
 *   📊 Real-time telemetry dashboard with Auto-Update at http://localhost:3001/stats
 *   🔴 Server-Sent Events (SSE) live streaming + 1-second auto-sync
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

// Upstream quota & usage tracking (synced from genzshop / upstream)
const upstreamUsageMap = new Map();

async function fetchUpstreamUsage(apiKey) {
  if (!apiKey || apiKey.includes('DÁN_KEY')) return null;
  try {
    const res = await fetch('https://genzshop.vn/api/check-usage.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'SK-Workspace-Gateway/1.0'
      },
      body: JSON.stringify({ apiKey }),
      signal: AbortSignal.timeout(10000)
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.success && data.usage) {
      upstreamUsageMap.set(apiKey, {
        ...data.usage,
        daily: data.daily || [],
        overage: data.overage || {},
        updatedAt: new Date().toISOString()
      });
      return data;
    }
  } catch (err) {
    // Network timeout or temporary failure - do not break proxy
  }
  return null;
}

let isSyncingUpstream = false;
async function syncAllKeysUpstream() {
  if (isSyncingUpstream) return;
  isSyncingUpstream = true;
  try {
    const activeKeys = config.keys.filter(k => k && !k.includes('DÁN_KEY'));
    for (const k of activeKeys) {
      await fetchUpstreamUsage(k);
    }
    broadcastStats();
  } finally {
    isSyncingUpstream = false;
  }
}

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

// Recent requests buffer (last 30 requests)
const recentRequests = [];
const MAX_RECENT_REQUESTS = 30;
let requestIdCounter = 0;

function addRecentRequest(reqInfo) {
  recentRequests.unshift(reqInfo);
  if (recentRequests.length > MAX_RECENT_REQUESTS) {
    recentRequests.pop();
  }
}

// Active Server-Sent Events (SSE) subscribers
const sseClients = new Set();

function broadcastStats() {
  if (sseClients.size === 0) return;
  const payload = JSON.stringify(getStatsPayload());
  const eventData = `data: ${payload}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(eventData);
    } catch {
      sseClients.delete(client);
    }
  }
}

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
        broadcastStats();
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

function getKeyLimit(key, idx = 0) {
  if (config.keyLimits && config.keyLimits[key]) {
    return Number(config.keyLimits[key]) || 150;
  }
  const defaultLimits = [150, 150, 300];
  return defaultLimits[idx] || 150;
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
    if (typeof bodyObj.system === 'string') {
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
      const lastSystem = bodyObj.system[bodyObj.system.length - 1];
      if (lastSystem && typeof lastSystem === 'object' && !lastSystem.cache_control) {
        lastSystem.cache_control = { type: 'ephemeral' };
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
 * Parses response body or SSE stream for token usage and updates telemetry
 */
function parseUsageTelemetry(text) {
  const result = { cacheRead: 0, cacheWrite: 0, inputTokens: 0, outputTokens: 0 };
  if (!text) return result;

  try {
    const parsed = JSON.parse(text);
    if (parsed.usage) {
      result.cacheRead = parsed.usage.cache_read_input_tokens || 0;
      result.cacheWrite = parsed.usage.cache_creation_input_tokens || 0;
      result.inputTokens = parsed.usage.input_tokens || 0;
      result.outputTokens = parsed.usage.output_tokens || 0;
    }
  } catch {
    // Check for usage in SSE events
    const matches = [...text.matchAll(/"usage"\s*:\s*\{([^}]+)\}/g)];
    if (matches.length > 0) {
      for (const m of matches) {
        const block = m[1];
        const rM = block.match(/"cache_read_input_tokens"\s*:\s*(\d+)/);
        const wM = block.match(/"cache_creation_input_tokens"\s*:\s*(\d+)/);
        const iM = block.match(/"input_tokens"\s*:\s*(\d+)/);
        const oM = block.match(/"output_tokens"\s*:\s*(\d+)/);
        if (rM) result.cacheRead = Math.max(result.cacheRead, parseInt(rM[1], 10));
        if (wM) result.cacheWrite = Math.max(result.cacheWrite, parseInt(wM[1], 10));
        if (iM) result.inputTokens = Math.max(result.inputTokens, parseInt(iM[1], 10));
        if (oM) result.outputTokens = Math.max(result.outputTokens, parseInt(oM[1], 10));
      }
    } else {
      const rM = text.match(/"cache_read_input_tokens"\s*:\s*(\d+)/);
      const wM = text.match(/"cache_creation_input_tokens"\s*:\s*(\d+)/);
      const iM = text.match(/"input_tokens"\s*:\s*(\d+)/);
      const oM = text.match(/"output_tokens"\s*:\s*(\d+)/);
      if (rM) result.cacheRead = parseInt(rM[1], 10);
      if (wM) result.cacheWrite = parseInt(wM[1], 10);
      if (iM) result.inputTokens = parseInt(iM[1], 10);
      if (oM) result.outputTokens = parseInt(oM[1], 10);
    }
  }

  if (result.cacheRead > 0) {
    telemetry.tokensCachedRead += result.cacheRead;
    telemetry.cacheHits++;
    log('CACHE', `⚡ [CACHE HIT] Đọc ${result.cacheRead.toLocaleString()} tokens từ cache (Tiết kiệm ~90% cost!)`);
  }
  if (result.cacheWrite > 0) {
    telemetry.tokensCachedWritten += result.cacheWrite;
    telemetry.cacheWrites++;
    log('CACHE', `💾 [CACHE WRITE] Ghi ${result.cacheWrite.toLocaleString()} tokens vào Anthropic cache.`);
  }
  if (result.inputTokens > 0) {
    telemetry.tokensInputUncached += result.inputTokens;
  }
  if (result.outputTokens > 0) {
    telemetry.tokensOutput += result.outputTokens;
  }

  return result;
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
 * Assembles unified telemetry payload for JSON API & SSE stream
 */
function getStatsPayload() {
  const uptimeSeconds = Math.round((Date.now() - telemetry.startedAt.getTime()) / 1000);
  const uptimeMinutes = Math.floor(uptimeSeconds / 60);
  const totalInputs = telemetry.tokensCachedRead + telemetry.tokensInputUncached;
  const hitRate = totalInputs > 0 ? ((telemetry.tokensCachedRead / totalInputs) * 100).toFixed(1) : '0.0';

  const totalDailyQuotaUsd = config.keys.reduce((sum, k, idx) => sum + getKeyLimit(k, idx), 0);
  let totalDailyUsedUsd = 0;

  const keys = config.keys.map((k, idx) => {
    const st = keyStates.get(k) || {};
    const limit = getKeyLimit(k, idx);
    const upstream = upstreamUsageMap.get(k) || null;
    const dailyUsed = upstream ? upstream.dailyCostUsed : null;
    if (dailyUsed !== null) totalDailyUsedUsd += dailyUsed;
    const dailyPercent = upstream ? (upstream.dailyCostPercent ?? (dailyUsed ? (dailyUsed / limit) * 100 : 0)) : null;
    const dailyRemaining = upstream && dailyUsed !== null ? Math.max(0, limit - dailyUsed) : null;
    const isQuotaExceeded = !!(st.quotaExceededUntil && st.quotaExceededUntil > Date.now()) || (dailyRemaining !== null && dailyRemaining <= 0);

    return {
      index: idx + 1,
      label: `Key #${idx + 1}`,
      masked: maskKey(k),
      dailyLimitUsd: limit,
      dailyUsedUsd: dailyUsed !== null ? parseFloat(dailyUsed.toFixed(2)) : null,
      dailyRemainingUsd: dailyRemaining !== null ? parseFloat(dailyRemaining.toFixed(2)) : null,
      dailyPercent: dailyPercent !== null ? parseFloat(dailyPercent.toFixed(1)) : null,
      totalCostUsd: upstream ? parseFloat(upstream.totalCost.toFixed(2)) : null,
      totalTokens: upstream ? upstream.totalTokens : null,
      expiresAt: upstream?.expiresAt || null,
      overageDays: upstream?.overage?.total_days || 0,
      upstreamRequests: upstream?.daily?.[0]?.daily_requests || upstream?.totalRequests || 0,
      status: isQuotaExceeded ? 'quota_exceeded' : 'active',
      statusText: isQuotaExceeded ? `Hết hạn mức ($${limit}) - Reset 07:00 VN` : `Sẵn sàng hoạt động`,
      requests: st.totalRequests || 0
    };
  });

  const totalDailyRemainingUsd = Math.max(0, totalDailyQuotaUsd - totalDailyUsedUsd);
  const totalDailyPercent = totalDailyQuotaUsd > 0 ? parseFloat(((totalDailyUsedUsd / totalDailyQuotaUsd) * 100).toFixed(1)) : 0;

  return {
    serverTime: new Date().toISOString(),
    uptimeSeconds,
    uptimeText: uptimeMinutes >= 60
      ? `${Math.floor(uptimeMinutes / 60)}h ${uptimeMinutes % 60}m`
      : `${uptimeMinutes} phút`,
    telemetry: {
      totalRequests: telemetry.totalRequests,
      successfulRequests: telemetry.successfulRequests,
      failedRequests: telemetry.failedRequests,
      cacheHits: telemetry.cacheHits,
      cacheWrites: telemetry.cacheWrites,
      tokensCachedRead: telemetry.tokensCachedRead,
      tokensCachedWritten: telemetry.tokensCachedWritten,
      tokensInputUncached: telemetry.tokensInputUncached,
      tokensOutput: telemetry.tokensOutput,
      hitRate: parseFloat(hitRate),
      estimatedUsdSaved: parseFloat(telemetry.estimatedUsdSaved.toFixed(3)),
      estimatedVndSaved: telemetry.estimatedVndSaved
    },
    config: {
      port: config.port,
      host: config.host,
      target: config.target,
      strategy: config.strategy,
      enablePromptCaching: config.enablePromptCaching,
      enableLocalResponseCache: config.enableLocalResponseCache,
      activeKeysCount: config.keys.length,
      totalDailyQuotaUsd,
      totalDailyUsedUsd: parseFloat(totalDailyUsedUsd.toFixed(2)),
      totalDailyRemainingUsd: parseFloat(totalDailyRemainingUsd.toFixed(2)),
      totalDailyPercent
    },
    keys,
    recentRequests: [...recentRequests]
  };
}

/**
 * Renders HTML Stats & Telemetry Dashboard with Auto-Update Real-time
 */
function renderHtmlDashboard() {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>SK Workspace - AI Gateway Realtime Telemetry</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #090d16;
      --card-bg: rgba(17, 24, 39, 0.85);
      --card-hover: rgba(30, 41, 59, 0.9);
      --border: rgba(255, 255, 255, 0.08);
      --border-focus: rgba(56, 189, 248, 0.4);
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --text-dim: #64748b;
      --primary: #38bdf8;
      --success: #34d399;
      --purple: #c084fc;
      --amber: #fbbf24;
      --red: #f87171;
    }
    * { box-sizing: border-box; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      margin: 0;
      padding: 24px;
      line-height: 1.5;
      min-height: 100vh;
      background-image: 
        radial-gradient(circle at 10% 20%, rgba(56, 189, 248, 0.05) 0%, transparent 40%),
        radial-gradient(circle at 90% 80%, rgba(192, 132, 252, 0.05) 0%, transparent 40%);
    }
    .container { max-width: 1080px; margin: 0 auto; }
    
    /* Header & Controls */
    .header-bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 24px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--border);
    }
    .brand-title {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .port-badge {
      font-size: 13px;
      font-weight: 600;
      background: rgba(2, 132, 199, 0.2);
      color: #38bdf8;
      border: 1px solid rgba(56, 189, 248, 0.3);
      padding: 3px 10px;
      border-radius: 20px;
    }
    .controls {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    .live-status {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.3);
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
      color: var(--success);
    }
    .live-dot {
      width: 9px;
      height: 9px;
      background: #22c55e;
      border-radius: 50%;
      display: inline-block;
      box-shadow: 0 0 10px #22c55e;
      animation: pulse 1.8s infinite;
    }
    @keyframes pulse {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
      70% { transform: scale(1.1); box-shadow: 0 0 0 7px rgba(34, 197, 94, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
    }
    .btn {
      background: #1e293b;
      color: #f1f5f9;
      border: 1px solid #334155;
      padding: 7px 14px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
    }
    .btn:hover { background: #334155; border-color: #475569; }
    .btn-primary { background: #0284c7; border-color: #0369a1; }
    .btn-primary:hover { background: #0369a1; }
    .btn-danger { background: rgba(239, 68, 68, 0.15); border-color: rgba(239, 68, 68, 0.3); color: #fca5a5; }
    .btn-danger:hover { background: rgba(239, 68, 68, 0.3); }
    .select-rate {
      background: #1e293b;
      color: #f1f5f9;
      border: 1px solid #334155;
      padding: 7px 10px;
      border-radius: 8px;
      font-size: 13px;
      cursor: pointer;
    }

    /* Grid & Cards */
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .card {
      background: var(--card-bg);
      border-radius: 14px;
      padding: 22px;
      border: 1px solid var(--border);
      backdrop-filter: blur(12px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
      transition: border-color 0.2s ease, transform 0.2s ease;
    }
    .card:hover { border-color: var(--border-focus); }
    
    .stat-label {
      font-size: 12px;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.7px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .stat-value {
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -0.5px;
      margin: 10px 0 6px 0;
      font-feature-settings: "tnum";
      font-variant-numeric: tabular-nums;
    }
    .stat-sub { font-size: 13px; color: var(--text-dim); }
    .green { color: var(--success); }
    .purple { color: var(--purple); }
    .cyan { color: var(--primary); }
    .blue { color: #60a5fa; }

    /* Breakdown Pill Bar */
    .pill-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 12px 18px;
      margin-bottom: 24px;
      font-size: 13px;
    }
    .pill-item { display: flex; align-items: center; gap: 8px; color: var(--text-muted); }
    .pill-item b { color: #f8fafc; font-family: 'JetBrains Mono', monospace; font-size: 13px; }

    /* Tables */
    .table-container { overflow-x: auto; margin-top: 12px; }
    table { width: 100%; border-collapse: collapse; text-align: left; }
    th {
      padding: 12px 14px;
      background: rgba(15, 23, 42, 0.8);
      color: var(--text-muted);
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid var(--border);
    }
    td {
      padding: 12px 14px;
      border-bottom: 1px solid var(--border);
      font-size: 13.5px;
      color: #e2e8f0;
    }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: rgba(255, 255, 255, 0.02); }
    .mono { font-family: 'JetBrains Mono', monospace; font-size: 12.5px; }

    /* Badges */
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 3px 9px;
      border-radius: 6px;
      font-size: 11.5px;
      font-weight: 600;
      letter-spacing: 0.3px;
    }
    .badge-success { background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.3); }
    .badge-warn { background: rgba(251, 191, 36, 0.15); color: #fde047; border: 1px solid rgba(251, 191, 36, 0.3); }
    .badge-error { background: rgba(248, 113, 113, 0.15); color: #fca5a5; border: 1px solid rgba(248, 113, 113, 0.3); }
    .badge-hit { background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); }
    .badge-write { background: rgba(192, 132, 252, 0.15); color: #c084fc; border: 1px solid rgba(192, 132, 252, 0.3); }

    /* Flash highlight for incoming rows */
    @keyframes flash {
      0% { background: rgba(56, 189, 248, 0.25); }
      100% { background: transparent; }
    }
    .flash-row { animation: flash 1.5s ease-out; }

    /* Toast */
    #toast {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #1e293b;
      border: 1px solid var(--border-focus);
      color: #f8fafc;
      padding: 10px 18px;
      border-radius: 10px;
      font-size: 13px;
      display: none;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
      z-index: 1000;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <header class="header-bar">
      <div>
        <h1 class="brand-title">
          ⚡ SK Workspace AI Gateway
          <span class="port-badge">Port ${config.port}</span>
        </h1>
        <div style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">
          Smart Prompt Caching (~90% Cost Reduction) & Cân Bằng Tải Anthropic Claude
        </div>
      </div>
      <div class="controls">
        <div class="live-status" id="live-indicator">
          <span class="live-dot" id="live-dot"></span>
          <span id="live-text">REALTIME (1.0s)</span>
        </div>
        <select class="select-rate" id="select-rate" onchange="changeUpdateInterval(this.value)">
          <option value="1000" selected>1s (Realtime)</option>
          <option value="2000">2s</option>
          <option value="5000">5s</option>
        </select>
        <button class="btn" id="btn-toggle" onclick="toggleAutoUpdate()">⏸️ Tạm dừng</button>
        <button class="btn" onclick="fetchImmediate()">🔄 Làm mới</button>
        <button class="btn" onclick="syncQuotaUpstream()">☁️ Đồng bộ Quota</button>
        <button class="btn btn-primary" onclick="testPing()">⚡ Test Ping</button>
        <button class="btn btn-danger" onclick="resetTelemetry()">🗑️ Reset</button>
      </div>
    </header>

    <!-- Top Metrics Grid -->
    <section class="grid">
      <div class="card">
        <div class="stat-label">
          <span>Tiết kiệm ước tính</span>
          <span>💰</span>
        </div>
        <div class="stat-value green" id="stat-vnd">0 đ</div>
        <div class="stat-sub" id="stat-usd">$0.000 USD quy đổi</div>
      </div>

      <div class="card">
        <div class="stat-label">
          <span>Cache Hit Rate</span>
          <span>🎯</span>
        </div>
        <div class="stat-value purple" id="stat-hitrate">0.0%</div>
        <div class="stat-sub" id="stat-hits-writes">0 Hits / 0 Writes</div>
      </div>

      <div class="card">
        <div class="stat-label">
          <span>Tokens đọc từ Cache</span>
          <span>⚡</span>
        </div>
        <div class="stat-value cyan" id="stat-tokens-cached">0</div>
        <div class="stat-sub">Giảm 90% giá input Anthropic</div>
      </div>

      <div class="card">
        <div class="stat-label">
          <span>Tổng số Requests</span>
          <span>📊</span>
        </div>
        <div class="stat-value blue" id="stat-total-reqs">0</div>
        <div class="stat-sub" id="stat-uptime">Uptime: 0 phút</div>
      </div>
    </section>

    <!-- Detailed Token Strip -->
    <div class="pill-bar">
      <div class="pill-item">💾 Ghi vào Cache: <b id="stat-tokens-written">0</b> tokens</div>
      <div class="pill-item">📥 Input Chưa Cache: <b id="stat-tokens-uncached">0</b> tokens</div>
      <div class="pill-item">📤 Output Generated: <b id="stat-tokens-output">0</b> tokens</div>
      <div class="pill-item">🟢 Thành công: <b id="stat-success-reqs" style="color:#4ade80;">0</b></div>
      <div class="pill-item">🔴 Thất bại: <b id="stat-failed-reqs" style="color:#f87171;">0</b></div>
    </div>

    <!-- Active API Keys Table -->
    <div class="card" style="margin-bottom: 24px;">
      <h3 style="margin: 0 0 4px 0; font-size: 17px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
        <span>🔑 Trạng Thái Các API Keys (<span id="key-count">${config.keys.length}</span> keys active)</span>
        <span id="total-quota-info" style="font-size: 13px; font-weight: normal; color: var(--text-dim);">
          Quota Pool: <b style="color: #38bdf8;">$600</b>/ngày • Đang đồng bộ...
        </span>
      </h3>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th style="width: 80px;">Key</th>
              <th>API Key</th>
              <th style="width: 110px;">Hạn mức</th>
              <th style="width: 180px;">Đã dùng hôm nay</th>
              <th style="width: 110px;">Còn lại</th>
              <th style="width: 110px;">Hết hạn</th>
              <th>Trạng thái</th>
              <th style="width: 90px; text-align: right;">Requests</th>
            </tr>
          </thead>
          <tbody id="keys-tbody">
            <!-- Rendered dynamically -->
          </tbody>
        </table>
      </div>
    </div>

    <!-- Quick Checker Tool (GenzShop API Key Checker) -->
    <div class="card" style="margin-bottom: 24px; border: 1px solid rgba(56, 189, 248, 0.25);">
      <h3 style="margin: 0 0 10px 0; font-size: 17px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
        <span>🔍 Tra Cứu Nhanh Quota / Usage / Overage Claude API Key</span>
        <span style="font-size: 12px; font-weight: normal; color: var(--text-dim);">Kiểm tra tức thì không cần đăng nhập • Trực tiếp từ GenzShop API</span>
      </h3>
      <div style="display: flex; gap: 10px; margin-bottom: 12px; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 280px; position: relative;">
          <input type="password" id="custom-api-key" placeholder="Dán API Key Claude vào đây (sk-ant-api03-...)" style="width: 100%; box-sizing: border-box; background: #0b1120; border: 1px solid var(--border); color: #f8fafc; padding: 10px 42px 10px 14px; border-radius: 8px; font-family: 'JetBrains Mono', monospace; font-size: 13px;" />
          <button type="button" onclick="toggleCustomKeyVis()" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: transparent; border: none; color: var(--text-muted); cursor: pointer; font-size: 14px;">👁️</button>
        </div>
        <button class="btn btn-primary" id="btn-custom-check" onclick="checkCustomKey()">🚀 Kiểm Tra Ngay</button>
        <button class="btn" onclick="checkActiveKey(1)">Key #1</button>
        <button class="btn" onclick="checkActiveKey(2)">Key #2</button>
        <button class="btn" onclick="checkActiveKey(3)">Key #3</button>
      </div>
      <div id="custom-check-result" style="display: none; background: rgba(15, 23, 42, 0.7); border: 1px solid var(--border); border-radius: 10px; padding: 16px; margin-top: 12px;">
        <!-- Rendered dynamically -->
      </div>
    </div>

    <!-- Live Request Activity Stream -->
    <div class="card" style="margin-bottom: 24px;">
      <h3 style="margin: 0 0 4px 0; font-size: 17px; display: flex; align-items: center; justify-content: space-between;">
        <span>🔴 Nhật Ký Hoạt Động Realtime (30 yêu cầu gần nhất)</span>
        <span style="font-size: 12px; font-weight: normal; color: var(--text-dim);">Tự động hiển thị ngay khi Claude Code gọi API</span>
      </h3>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th style="width: 90px;">Thời gian</th>
              <th style="width: 170px;">Endpoint</th>
              <th style="width: 130px;">Key</th>
              <th style="width: 100px;">HTTP Status</th>
              <th style="width: 100px;">Độ trễ</th>
              <th>Token Metrics & Cache Status</th>
            </tr>
          </thead>
          <tbody id="requests-tbody">
            <tr>
              <td colspan="6" style="text-align: center; color: var(--text-dim); padding: 30px;">
                Đang chờ yêu cầu API đầu tiên... Hãy bắt đầu sử dụng Claude Code với Base URL: <code>http://localhost:${config.port}/v1</code>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Proxy Configuration Details -->
    <div class="card">
      <h3 style="margin: 0 0 12px 0; font-size: 16px;">⚙️ Cấu Hình Hoạt Động & Hướng Dẫn</h3>
      <ul style="color: #cbd5e1; line-height: 1.8; margin: 0; padding-left: 20px; font-size: 13.5px;">
        <li><b>Prompt Caching:</b> ${config.enablePromptCaching ? '✅ <span style="color:#4ade80;">BẬT</span> (Tự động inject cache_control vào System, Tools & Messages)' : '❌ TẮT'}</li>
        <li><b>Local Models Cache:</b> ${config.enableLocalResponseCache ? '✅ <span style="color:#4ade80;">BẬT</span> (Cache /v1/models 1 giờ trong RAM)' : '❌ TẮT'}</li>
        <li><b>Target Upstream:</b> <code>${config.target}</code></li>
        <li><b>Cân bằng tải:</b> <code>${config.strategy}</code> (Tự động phân phối đồng đều giữa các API keys)</li>
        <li><b>Auto-Failover:</b> Tự động đổi key tức thì khi gặp mã lỗi 429 (Rate Limit) hoặc 524/504 (Cloudflare Timeout)</li>
      </ul>
    </div>
  </div>

  <div id="toast"></div>

  <!-- Realtime Client Script -->
  <script>
    let isAutoUpdating = true;
    let pollIntervalMs = 1000;
    let pollTimer = null;
    let eventSource = null;
    let lastRequestId = 0;

    function showToast(msg) {
      const t = document.getElementById('toast');
      t.textContent = msg;
      t.style.display = 'block';
      setTimeout(() => { t.style.display = 'none'; }, 2500);
    }

    function formatNumber(num) {
      return (num || 0).toLocaleString();
    }

    function renderDashboard(data) {
      if (!data || !isAutoUpdating) return;

      const t = data.telemetry || {};

      // Main metrics
      document.getElementById('stat-vnd').textContent = (t.estimatedVndSaved || 0).toLocaleString() + ' đ';
      document.getElementById('stat-usd').textContent = '$' + (t.estimatedUsdSaved || 0).toFixed(3) + ' USD quy đổi';
      document.getElementById('stat-hitrate').textContent = (t.hitRate || 0).toFixed(1) + '%';
      document.getElementById('stat-hits-writes').textContent = (t.cacheHits || 0) + ' Hits / ' + (t.cacheWrites || 0) + ' Writes';
      document.getElementById('stat-tokens-cached').textContent = formatNumber(t.tokensCachedRead);
      document.getElementById('stat-total-reqs').textContent = formatNumber(t.totalRequests);
      document.getElementById('stat-uptime').textContent = 'Uptime: ' + (data.uptimeText || '0 phút');

      // Detailed token metrics
      document.getElementById('stat-tokens-written').textContent = formatNumber(t.tokensCachedWritten);
      document.getElementById('stat-tokens-uncached').textContent = formatNumber(t.tokensInputUncached);
      document.getElementById('stat-tokens-output').textContent = formatNumber(t.tokensOutput);
      document.getElementById('stat-success-reqs').textContent = formatNumber(t.successfulRequests);
      document.getElementById('stat-failed-reqs').textContent = formatNumber(t.failedRequests);

      // Render Keys
      if (Array.isArray(data.keys)) {
        document.getElementById('key-count').textContent = data.keys.length;
        if (data.config?.totalDailyQuotaUsd) {
          const totalQ = data.config.totalDailyQuotaUsd;
          const totalU = data.config.totalDailyUsedUsd || 0;
          const totalR = data.config.totalDailyRemainingUsd || (totalQ - totalU);
          const totalP = data.config.totalDailyPercent || (totalQ > 0 ? ((totalU / totalQ) * 100).toFixed(1) : 0);
          const poolElem = document.getElementById('total-quota-info');
          if (poolElem) {
            poolElem.innerHTML = \`
              Quota Pool: <b style="color: #38bdf8;">$\${totalQ}</b>/ngày • Đã dùng: <b style="color: #fbbf24;">$\${totalU}</b> (\${totalP}%) • Còn lại: <b style="color: #4ade80;">$\${totalR}</b>
            \`;
          }
        }
        const keysHtml = data.keys.map(k => {
          const isQuota = k.status === 'quota_exceeded';
          const badgeClass = isQuota ? 'badge-error' : 'badge-success';
          const percent = k.dailyPercent !== null ? k.dailyPercent : 0;
          const barColor = percent > 90 ? '#f87171' : percent > 60 ? '#fbbf24' : '#38bdf8';
          const usedStr = k.dailyUsedUsd !== null ? \`$\${k.dailyUsedUsd} (\${percent}%)\` : '<span style="color:var(--text-dim);">Đang sync...</span>';
          const remainStr = k.dailyRemainingUsd !== null ? \`$\${k.dailyRemainingUsd}\` : '--';
          const expiryStr = k.expiresAt ? new Date(k.expiresAt).toLocaleDateString('vi-VN') : '--';
          const reqsCount = k.upstreamRequests || k.requests || 0;

          return \`
            <tr>
              <td style="font-weight: 700; color: #f1f5f9;">\${k.label}</td>
              <td class="mono">\${k.masked}</td>
              <td style="font-weight: 700; color: #38bdf8;">$\${k.dailyLimitUsd}/ngày</td>
              <td>
                <div style="font-size: 12.5px; font-weight: 600; margin-bottom: 4px;">\${usedStr}</div>
                <div style="background: rgba(255,255,255,0.08); border-radius: 4px; height: 5px; overflow: hidden; width: 100%;">
                  <div style="background: \${barColor}; width: \${Math.min(100, percent)}%; height: 100%; border-radius: 4px; transition: width 0.3s ease;"></div>
                </div>
              </td>
              <td style="font-weight: 700; color: #4ade80;">\${remainStr}</td>
              <td style="font-size: 12px; color: var(--text-dim);">\${expiryStr}</td>
              <td><span class="badge \${badgeClass}">\${k.statusText}</span></td>
              <td style="text-align: right; font-weight: 700; font-family: 'JetBrains Mono';">\${reqsCount}</td>
            </tr>
          \`;
        }).join('');
        document.getElementById('keys-tbody').innerHTML = keysHtml;
      }

      // Render Recent Requests
      const reqs = data.recentRequests || [];
      const tbody = document.getElementById('requests-tbody');

      if (reqs.length === 0) {
        tbody.innerHTML = \`
          <tr>
            <td colspan="6" style="text-align: center; color: var(--text-dim); padding: 30px;">
              Đang chờ yêu cầu API... Base URL Claude Code: <code>http://localhost:\${data.config?.port || 3001}/v1</code>
            </td>
          </tr>
        \`;
      } else {
        const rowsHtml = reqs.map(r => {
          const isHit = r.cacheRead > 0;
          const isWrite = r.cacheWrite > 0;
          let cacheBadge = '<span style="color: var(--text-dim);">Chưa cache</span>';
          if (isHit) {
            cacheBadge = \`<span class="badge badge-hit">⚡ Cache Hit: +\${formatNumber(r.cacheRead)} tok</span>\`;
          } else if (isWrite) {
            cacheBadge = \`<span class="badge badge-write">💾 Cache Write: +\${formatNumber(r.cacheWrite)} tok</span>\`;
          }

          let statusBadge = '<span class="badge badge-success">200 OK</span>';
          if (r.status === 429) statusBadge = '<span class="badge badge-warn">429 Limit</span>';
          else if (r.status >= 500) statusBadge = \`<span class="badge badge-error">\${r.status} Error</span>\`;
          else if (r.status !== 200) statusBadge = \`<span class="badge badge-warn">\${r.status}</span>\`;

          const isNew = r.id > lastRequestId;
          const flashClass = isNew ? 'class="flash-row"' : '';

          return \`
            <tr \${flashClass}>
              <td class="mono" style="color: var(--text-muted);">\${r.timestamp}</td>
              <td class="mono"><b>\${r.method}</b> <span style="color:#94a3b8;">\${r.path}</span></td>
              <td style="font-weight: 500;">\${r.keyLabel}</td>
              <td>\${statusBadge}</td>
              <td class="mono" style="color: var(--text-muted);">\${r.durationMs}ms</td>
              <td>\${cacheBadge}</td>
            </tr>
          \`;
        }).join('');

        tbody.innerHTML = rowsHtml;
        if (reqs.length > 0) {
          lastRequestId = Math.max(lastRequestId, ...reqs.map(r => r.id || 0));
        }
      }
    }

    async function fetchImmediate() {
      try {
        const res = await fetch('/stats.json', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          renderDashboard(data);
          showToast('✅ Đã cập nhật số liệu mới nhất');
        }
      } catch (err) {
        console.error('Fetch stats failed:', err);
      }
    }

    function setupRealtimeStream() {
      if (window.EventSource) {
        try {
          if (eventSource) eventSource.close();
          eventSource = new EventSource('/stats/stream');

          eventSource.onopen = () => {
            const ind = document.getElementById('live-text');
            const dot = document.getElementById('live-dot');
            ind.textContent = 'REALTIME (SSE Live)';
            dot.style.background = '#22c55e';
          };

          eventSource.onmessage = (e) => {
            try {
              const data = JSON.parse(e.data);
              renderDashboard(data);
            } catch (err) {
              console.error('Failed to parse SSE payload:', err);
            }
          };

          eventSource.onerror = () => {
            // Revert gracefully to polling
            document.getElementById('live-text').textContent = 'REALTIME (' + (pollIntervalMs / 1000).toFixed(1) + 's Sync)';
          };
        } catch {
          startPolling();
        }
      } else {
        startPolling();
      }

      // Always maintain backup polling to keep clocks and zero-request intervals smooth
      startPolling();
    }

    function startPolling() {
      if (pollTimer) clearInterval(pollTimer);
      pollTimer = setInterval(async () => {
        if (!isAutoUpdating) return;
        try {
          const res = await fetch('/stats.json', { cache: 'no-store' });
          if (res.ok) {
            const data = await res.json();
            renderDashboard(data);
          }
        } catch (err) {}
      }, pollIntervalMs);
    }

    function toggleAutoUpdate() {
      isAutoUpdating = !isAutoUpdating;
      const btn = document.getElementById('btn-toggle');
      const ind = document.getElementById('live-text');
      const dot = document.getElementById('live-dot');

      if (isAutoUpdating) {
        btn.textContent = '⏸️ Tạm dừng';
        ind.textContent = 'REALTIME (' + (pollIntervalMs / 1000).toFixed(1) + 's)';
        dot.style.background = '#22c55e';
        showToast('▶️ Đã bật tự động cập nhật Realtime');
        fetchImmediate();
      } else {
        btn.textContent = '▶️ Tiếp tục';
        ind.textContent = 'ĐÃ TẠM DỪNG';
        dot.style.background = '#f59e0b';
        showToast('⏸️ Đã tạm dừng cập nhật');
      }
    }

    function changeUpdateInterval(val) {
      pollIntervalMs = parseInt(val, 10) || 1000;
      if (isAutoUpdating) {
        startPolling();
        document.getElementById('live-text').textContent = 'REALTIME (' + (pollIntervalMs / 1000).toFixed(1) + 's)';
        showToast('⏱️ Chu kỳ cập nhật: ' + (pollIntervalMs / 1000) + 's');
      }
    }

    async function testPing() {
      showToast('⚡ Đang gửi ping thử nghiệm tới /v1/models...');
      try {
        const start = Date.now();
        const res = await fetch('/v1/models');
        const duration = Date.now() - start;
        if (res.ok) {
          showToast('✅ Ping thành công! Phản hồi trong ' + duration + 'ms');
          setTimeout(fetchImmediate, 200);
        } else {
          showToast('⚠️ Ping trả về HTTP ' + res.status);
        }
      } catch (err) {
        showToast('❌ Ping thất bại: ' + err.message);
      }
    }

    async function resetTelemetry() {
      if (!confirm('Bạn có chắc chắn muốn đặt lại tất cả số liệu thống kê về 0?')) return;
      try {
        const res = await fetch('/stats/reset', { method: 'POST' });
        if (res.ok) {
          showToast('🗑️ Đã đặt lại toàn bộ thống kê');
          setTimeout(fetchImmediate, 100);
        }
      } catch (err) {
        showToast('❌ Reset thất bại: ' + err.message);
      }
    }

    async function syncQuotaUpstream() {
      showToast('☁️ Đang đồng bộ Quota và Usage thực tế từ Upstream...');
      try {
        const res = await fetch('/stats/sync-quota', { method: 'POST' });
        if (res.ok) {
          showToast('✅ Đã đồng bộ Quota thành công!');
          setTimeout(fetchImmediate, 100);
        } else {
          showToast('⚠️ Đồng bộ Quota trả về lỗi');
        }
      } catch (err) {
        showToast('❌ Đồng bộ thất bại: ' + err.message);
      }
    }

    function toggleCustomKeyVis() {
      const inp = document.getElementById('custom-api-key');
      inp.type = inp.type === 'password' ? 'text' : 'password';
    }

    async function checkActiveKey(idx) {
      showToast('Đang lấy API Key #' + idx + '...');
      try {
        const res = await fetch('/api/active-key?idx=' + idx);
        const data = await res.json();
        if (data.key) {
          document.getElementById('custom-api-key').value = data.key;
          checkCustomKey();
        }
      } catch (err) {
        showToast('Lỗi: ' + err.message);
      }
    }

    async function checkCustomKey() {
      const inp = document.getElementById('custom-api-key');
      const key = inp.value.trim();
      if (!key) {
        showToast('⚠️ Vui lòng nhập API Key');
        return;
      }

      const resBox = document.getElementById('custom-check-result');
      const btn = document.getElementById('btn-custom-check');
      resBox.style.display = 'block';
      resBox.innerHTML = '<div style="color: #38bdf8; text-align: center; padding: 20px;">⏳ Đang kiểm tra Usage, Daily Usage và Overage...</div>';
      btn.disabled = true;

      try {
        const res = await fetch('/api/check-key', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apiKey: key })
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Kiểm tra thất bại');
        }

        const u = data.usage || {};
        const daily = data.daily || [];
        const overage = data.overage || {};
        const dailyLimit = u.dailyCostLimit || 0;
        const dailyUsed = u.dailyCostUsed || 0;
        const dailyRem = dailyLimit > 0 ? Math.max(0, dailyLimit - dailyUsed) : null;
        const dailyPercent = dailyLimit > 0 ? ((dailyUsed / dailyLimit) * 100).toFixed(1) : (u.dailyCostPercent ? Number(u.dailyCostPercent).toFixed(1) : 0);

        resBox.innerHTML = \`
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
            <div style="background: rgba(2, 132, 199, 0.1); border: 1px solid rgba(56, 189, 248, 0.2); padding: 12px; border-radius: 8px;">
              <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Đã dùng hôm nay</div>
              <div style="font-size: 20px; font-weight: 800; color: #fbbf24; margin: 4px 0;">$\${dailyUsed.toFixed(2)} <span style="font-size: 13px; font-weight: 600; color: #94a3b8;">/ $\${dailyLimit} (\${dailyPercent}%)</span></div>
              <div style="font-size: 12px; color: #4ade80;">Còn lại: $\${dailyRem !== null ? dailyRem.toFixed(2) : '--'}</div>
            </div>
            <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); padding: 12px; border-radius: 8px;">
              <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Tổng chi phí tích lũy</div>
              <div style="font-size: 20px; font-weight: 800; color: #4ade80; margin: 4px 0;">$\${(u.totalCost || 0).toFixed(2)}</div>
              <div style="font-size: 12px; color: var(--text-dim);">Tổng Tokens: \${formatNumber(u.totalTokens || 0)}</div>
            </div>
            <div style="background: rgba(192, 132, 252, 0.1); border: 1px solid rgba(192, 132, 252, 0.2); padding: 12px; border-radius: 8px;">
              <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Hết hạn & Reset</div>
              <div style="font-size: 14px; font-weight: 700; color: #f1f5f9; margin: 4px 0;">\${u.expiresAt ? new Date(u.expiresAt).toLocaleDateString('vi-VN') : '--'}</div>
              <div style="font-size: 12px; color: var(--text-dim);">Reset quota: 07:00 sáng VN</div>
            </div>
            <div style="background: rgba(248, 113, 113, 0.1); border: 1px solid rgba(248, 113, 113, 0.2); padding: 12px; border-radius: 8px;">
              <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Tình trạng Overage</div>
              <div style="font-size: 16px; font-weight: 800; color: \${overage.total_days > 0 ? '#fca5a5' : '#4ade80'}; margin: 4px 0;">
                \${overage.total_days > 0 ? (overage.total_days + ' ngày vượt mức nhẹ ($' + Number(overage.total_overage || 0).toFixed(2) + ')') : 'Không overage (An toàn)'}
              </div>
              <div style="font-size: 12px; color: var(--text-dim);">Số requests: \${u.totalRequests || 0}</div>
            </div>
          </div>
        \`;
        showToast('✅ Kiểm tra thành công!');
      } catch (err) {
        resBox.innerHTML = '<div style="color: #f87171; padding: 12px;">❌ ' + err.message + '</div>';
        showToast('❌ ' + err.message);
      } finally {
        btn.disabled = false;
      }
    }

    // Initialize on load
    window.addEventListener('DOMContentLoaded', () => {
      fetchImmediate();
      setupRealtimeStream();
    });
  </script>
</body>
</html>`;
}

const server = http.createServer(async (req, res) => {
  // CORS Headers for browser requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Health check endpoint
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

  // HTML Dashboard
  if (req.url === '/stats' || req.url === '/dashboard' || req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(renderHtmlDashboard());
    return;
  }

  // JSON Telemetry API
  if (req.url === '/stats.json') {
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });
    res.end(JSON.stringify(getStatsPayload(), null, 2));
    return;
  }

  // Real-time Server-Sent Events (SSE) Stream
  if (req.url === '/stats/stream') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive'
    });
    res.write(`data: ${JSON.stringify(getStatsPayload())}\n\n`);
    sseClients.add(res);

    req.on('close', () => {
      sseClients.delete(res);
    });
    return;
  }

  // Reset telemetry
  if (req.url === '/stats/reset' && req.method === 'POST') {
    telemetry.totalRequests = 0;
    telemetry.successfulRequests = 0;
    telemetry.failedRequests = 0;
    telemetry.cacheHits = 0;
    telemetry.cacheWrites = 0;
    telemetry.tokensCachedRead = 0;
    telemetry.tokensCachedWritten = 0;
    telemetry.tokensInputUncached = 0;
    telemetry.tokensOutput = 0;
    recentRequests.length = 0;
    for (const st of keyStates.values()) {
      st.totalRequests = 0;
    }
    broadcastStats();
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: true, message: 'Đã reset thống kê thành công' }));
    return;
  }

  // Sync Quota from Upstream
  if (req.url === '/stats/sync-quota' && req.method === 'POST') {
    await syncAllKeysUpstream();
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: true, message: 'Đã đồng bộ hạn mức thành công' }));
    return;
  }

  // Active key retrieval for quick test (by index)
  if (req.url.startsWith('/api/active-key')) {
    const u = new URL(req.url, 'http://127.0.0.1');
    const idx = parseInt(u.searchParams.get('idx') || '1', 10) - 1;
    const activeKeys = config.keys.filter(k => k && !k.includes('DÁN_KEY'));
    const targetKey = activeKeys[idx] || activeKeys[0] || '';
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ key: targetKey }));
    return;
  }

  // Custom key usage check
  if (req.url.startsWith('/api/check-key')) {
    let keyToCheck = '';
    if (req.method === 'POST') {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      try {
        const parsed = JSON.parse(Buffer.concat(chunks).toString('utf-8'));
        keyToCheck = parsed.apiKey || parsed.key || '';
      } catch {}
    } else {
      const u = new URL(req.url, 'http://127.0.0.1');
      keyToCheck = u.searchParams.get('key') || '';
    }

    if (!keyToCheck) {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: false, error: 'Vui lòng cung cấp apiKey' }));
      return;
    }

    try {
      const upstreamRes = await fetch('https://genzshop.vn/api/check-usage.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: keyToCheck }),
        signal: AbortSignal.timeout(10000)
      });
      const data = await upstreamRes.json();
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(data));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
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
    const reqStartTime = Date.now();
    loadConfig();
    telemetry.totalRequests++;
    broadcastStats(); // Update live request counter immediately

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
          const errChunks = [];
          for await (const chunk of upstreamRes) {
            errChunks.push(chunk);
          }
          const errBody = Buffer.concat(errChunks).toString('utf-8');

          if (errBody.includes('cost_limit_exceeded')) {
            const currentIdx = availableKeys.indexOf(currentKey);
            const keyLimit = getKeyLimit(currentKey, currentIdx);
            const tomorrowUtc = new Date();
            tomorrowUtc.setUTCDate(tomorrowUtc.getUTCDate() + 1);
            tomorrowUtc.setUTCHours(0, 0, 0, 0);
            keyState.quotaExceededUntil = tomorrowUtc.getTime();

            log('WARN', `⚠️ [QUOTA] ${keyLabel} đã đạt hạn mức $${keyLimit}/ngày! Reset lúc 07:00 VN.`);

            if (attempts < candidateKeys.length - 1) {
              log('INFO', `Tự động chuyển tiếp sang Key khả dụng khác...`);
              attempts++;
              continue;
            } else {
              const totalPool = availableKeys.reduce((sum, k, idx) => sum + getKeyLimit(k, idx), 0);
              log('ERR', `⛔ [HẾT QUOTA TẤT CẢ KEYS] Tất cả các keys đều đã đạt hạn mức ngày ($${totalPool}/ngày)!`);
              res.writeHead(429, { 'Content-Type': 'application/json; charset=utf-8' });
              res.end(JSON.stringify({
                error: {
                  code: 'all_keys_cost_limit_exceeded',
                  message: `Tất cả các API key đều đã đạt hạn mức ngày (Tổng $${totalPool}/ngày: Key 1 $150, Key 2 $150, Key 3 $300). Hạn mức sẽ tự động mở lại lúc 07:00 sáng mai (giờ VN).`,
                  reset_at: tomorrowUtc.toISOString(),
                  advice: 'Bạn có thể dán thêm API key mới vào scripts/proxy-config.json để tiếp tục ngay lập tức.'
                }
              }));
              broadcastStats();
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
          if (responseBuffer.length < 100000) {
            responseBuffer += chunk.toString('utf-8');
          }
        });

        upstreamRes.on('end', () => {
          res.end();
          const durationMs = Date.now() - reqStartTime;
          const usage = parseUsageTelemetry(responseBuffer);

          addRecentRequest({
            id: ++requestIdCounter,
            timestamp: new Date().toLocaleTimeString('vi-VN', { hour12: false }),
            method: req.method,
            path: req.url.split('?')[0],
            keyLabel: `Key #${availableKeys.indexOf(currentKey) + 1}`,
            keyMasked: maskKey(currentKey),
            status,
            durationMs,
            cacheRead: usage.cacheRead,
            cacheWrite: usage.cacheWrite,
            inputTokens: usage.inputTokens,
            outputTokens: usage.outputTokens
          });

          broadcastStats();

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
    const durationMs = Date.now() - reqStartTime;
    addRecentRequest({
      id: ++requestIdCounter,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour12: false }),
      method: req.method,
      path: req.url.split('?')[0],
      keyLabel: 'All Keys Failed',
      keyMasked: 'None',
      status: 502,
      durationMs,
      cacheRead: 0,
      cacheWrite: 0,
      inputTokens: 0,
      outputTokens: 0
    });
    broadcastStats();

    log('ERR', `Tất cả ${candidateKeys.length} keys đều thất bại! Lỗi cuối: ${lastError?.message}`);
    res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      error: 'Proxy: Tất cả API keys đều không phản hồi.',
      details: lastError?.message || 'Upstream timeout / error'
    }));
  });
});

// Periodic heartbeat broadcast every 2.5s to keep active SSE connections fresh
setInterval(() => {
  broadcastStats();
}, 2500);

server.listen(config.port, config.host, () => {
  console.log('\n=============================================================');
  console.log('   🚀 SK WORKSPACE AI GATEWAY PROXY (PROMPT CACHING READY)   ');
  console.log('=============================================================');
  const totalDailyPool = config.keys.reduce((sum, k, idx) => sum + getKeyLimit(k, idx), 0);
  log('OK', `Proxy đang chạy tại:        http://${config.host}:${config.port}`);
  log('CACHE', `Prompt Caching:             ${config.enablePromptCaching ? 'BẬT (Tiết kiệm tới 90% chi phí input)' : 'TẮT'}`);
  log('INFO', `Upstream Target:            ${config.target}`);
  log('INFO', `Số Keys cấu hình:           ${config.keys.filter(k => k && !k.includes('DÁN_KEY')).length} keys`);
  log('INFO', `Hạn mức Quota ngày:         Tổng $${totalDailyPool}/ngày (Key 1: $150, Key 2: $150, Key 3: $300)`);
  log('INFO', `Dashboard thống kê cache:   http://${config.host}:${config.port}/stats`);
  log('INFO', `Cập nhật Realtime:          BẬT (SSE Stream + Auto-Sync 1.0s)`);
  log('INFO', `File cấu hình:              ${CONFIG_PATH}`);
  console.log('-------------------------------------------------------------');
  console.log('👉 Base URL cho Claude Code / IDE:');
  console.log(`   http://localhost:${config.port}/v1`);
  console.log('=============================================================\n');

  // Initial upstream sync on boot
  syncAllKeysUpstream().catch(() => {});
  // Periodic background quota sync every 3 minutes
  setInterval(() => {
    syncAllKeysUpstream().catch(() => {});
  }, 180000);
});
