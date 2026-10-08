#!/usr/bin/env node
/**
 * SK Workspace - Local AI Gateway Proxy with Auto-Failover & Load Balancing
 * Zero external dependencies. Works on Node 18+ (Node 24 native).
 * 
 * Usage:
 *   node scripts/gateway-proxy.mjs
 */

import http from 'node:http';
import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.resolve(__dirname, 'proxy-config.json');
const EXAMPLE_CONFIG_PATH = path.resolve(__dirname, 'proxy-config.example.json');

// Default config
let config = {
  port: 3001,
  host: '127.0.0.1',
  target: 'https://1gw.gwai.cloud',
  timeoutMs: 100000, // 100s (failover before Cloudflare 120s timeout)
  strategy: 'round-robin', // 'round-robin' | 'fallback'
  keys: []
};

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
}

// Initial load
loadConfig();

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
    RESET: '\x1b[0m'
  };
  const color = colors[level] || colors.INFO;
  console.log(`[${ts}] ${color}[${level}]${colors.RESET} ${msg}`);
}

function maskKey(key) {
  if (!key || key.length < 10) return '***';
  return `${key.slice(0, 6)}...${key.slice(-4)}`;
}

// Forward request to upstream target
function forwardUpstream(req, reqBody, key, attempt = 1) {
  return new Promise((resolve, reject) => {
    const cleanPath = req.url.replace(/^\/v1\/v1/, '/v1');
    const targetUrl = new URL(cleanPath, config.target);
    const isHttps = targetUrl.protocol === 'https:';
    const client = isHttps ? https : http;

    const headers = { ...req.headers };
    // Replace host
    headers['host'] = targetUrl.host;
    
    // Inject API key into standard auth headers
    if (key) {
      if (headers['x-api-key'] || req.url.includes('/messages')) {
        headers['x-api-key'] = key;
      }
      if (headers['authorization'] || !headers['x-api-key']) {
        headers['authorization'] = `Bearer ${key}`;
      }
    }

    // Remove hop-by-hop headers
    delete headers['connection'];
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

const server = http.createServer(async (req, res) => {
  // Health check / info
  if (req.url === '/health' || req.url === '/_proxy_status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      keysConfigured: config.keys.length,
      keys: config.keys.map(maskKey),
      target: config.target,
      strategy: config.strategy
    }, null, 2));
    return;
  }

  // Collect request body
  const chunks = [];
  req.on('data', chunk => chunks.push(chunk));
  req.on('end', async () => {
    const reqBody = Buffer.concat(chunks);
    loadConfig();
    const availableKeys = config.keys.filter(k => k && !k.includes('DÁN_KEY'));

    if (availableKeys.length === 0) {
      log('ERR', `Chưa có API key hợp lệ trong file ${CONFIG_PATH}!`);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Proxy: Chưa cấu hình API key trong scripts/proxy-config.json'
      }));
      return;
    }

    // Select initial key
    let selectedIdx = config.strategy === 'round-robin' 
      ? (keyIndex++) % availableKeys.length 
      : 0;

    let attempts = 0;
    let lastError = null;

    // Retry loop across keys
    while (attempts < availableKeys.length) {
      const currentKey = availableKeys[(selectedIdx + attempts) % availableKeys.length];
      const keyLabel = `Key #${((selectedIdx + attempts) % availableKeys.length) + 1} (${maskKey(currentKey)})`;

      log('INFO', `${req.method} ${req.url} -> Đang gửi qua ${keyLabel} (Lần thử ${attempts + 1}/${availableKeys.length})`);

      try {
        const { upstreamRes } = await forwardUpstream(req, reqBody, currentKey, attempts + 1);

        // Check for failover triggers (524, 429, 500, 502, 503, 504)
        const status = upstreamRes.statusCode;
        const isRetriable = status === 524 || status === 429 || status === 502 || status === 503 || status === 504 || status === 500;

        if (isRetriable && attempts < availableKeys.length - 1) {
          log('WARN', `${keyLabel} trả về mã lỗi HTTP ${status}! Tự động đổi sang Key tiếp theo...`);
          // Consume response to free socket
          upstreamRes.resume();
          attempts++;
          continue;
        }

        // Success or non-retriable: stream response back to client
        log(status < 400 ? 'OK' : 'WARN', `${keyLabel} phản hồi HTTP ${status}`);
        
        // Forward headers
        const resHeaders = { ...upstreamRes.headers };
        res.writeHead(status, resHeaders);
        upstreamRes.pipe(res);
        return;

      } catch (err) {
        lastError = err;
        log('WARN', `${keyLabel} lỗi kết nối: ${err.message}. Tự động đổi sang Key tiếp theo...`);
        attempts++;
      }
    }

    // If all keys failed
    log('ERR', `Tất cả ${availableKeys.length} keys đều thất bại! Lỗi cuối: ${lastError?.message}`);
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'Proxy: Tất cả API keys đều không phản hồi.',
      details: lastError?.message || 'Upstream timeout / error'
    }));
  });
});

server.listen(config.port, config.host, () => {
  console.log('\n======================================================');
  console.log('   🚀 SK WORKSPACE AI GATEWAY PROXY (AUTO-FAILOVER)   ');
  console.log('======================================================');
  log('OK', `Proxy đang chạy tại: http://${config.host}:${config.port}`);
  log('INFO', `Upstream Target:     ${config.target}`);
  log('INFO', `Số Keys cấu hình:    ${config.keys.filter(k => k && !k.includes('DÁN_KEY')).length} keys`);
  log('INFO', `Cơ chế hoạt động:    Cân bằng tải Round-Robin + Tự động chuyển Key khi lỗi 524/429`);
  log('INFO', `File cấu hình:       ${CONFIG_PATH}`);
  console.log('------------------------------------------------------');
  console.log('👉 Hướng dẫn: Đổi Base URL trong Claude / App thành:');
  console.log(`   http://localhost:${config.port}/v1`);
  console.log('======================================================\n');
});
