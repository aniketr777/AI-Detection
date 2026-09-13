/**
 * Visitor Authorization Utility
 *
 * Determines whether a request comes from an authorized visitor or a
 * crawler/scraper that should receive decoy data instead of real content.
 *
 * Two signals are checked:
 *   1. IP Match    — visitor's request IP vs ALLOWED_VISITOR_IP env var
 *   2. Bot UA      — known crawler/scraper User-Agent signatures
 *
 * If ALLOWED_VISITOR_IP is NOT configured, only the bot UA check applies.
 */

// Known crawler / scraper / bot user-agent substrings (case-insensitive)
const BOT_UA_PATTERNS = [
  'googlebot',
  'bingbot',
  'slurp',          // Yahoo
  'duckduckbot',
  'baiduspider',
  'yandexbot',
  'sogou',
  'exabot',
  'facebot',
  'ia_archiver',    // Wayback Machine
  'semrushbot',
  'ahrefsbot',
  'mj12bot',
  'dotbot',
  'rogerbot',
  'seznambot',
  'archive.org_bot',
  'petalbot',
  'bytespider',     // TikTok
  'gptbot',         // OpenAI GPT crawler
  'anthropic-ai',   // Claude crawler
  'claudebot',
  'perplexitybot',
  'cohere-ai',
  'python-requests',
  'python-httpx',
  'go-http-client',
  'axios/',
  'node-fetch',
  'curl/',
  'wget/',
  'scrapy',
  'httpie',
  'java/',
  'okhttp',
  'libwww-perl',
  'lwp-trivial',
  'mechanize',
  'httpclient',
  'postman',
];

/**
 * Extracts and normalizes the visitor's IP from the request.
 * Supports all major cloud/CDN proxy headers.
 *
 * @param {import('express').Request} req
 * @returns {string} clean IP address
 */
export function getVisitorIp(req) {
  const forwardedFor = req.headers['x-forwarded-for'];
  const raw =
    (forwardedFor ? forwardedFor.split(',')[0].trim() : null) ||
    req.headers['x-real-ip'] ||
    req.headers['cf-connecting-ip'] ||
    req.headers['true-client-ip'] ||
    req.socket?.remoteAddress ||
    req.ip ||
    '127.0.0.1';
  return raw.replace(/^::ffff:/, '').trim();
}

/**
 * Returns true if the User-Agent matches a known bot/scraper signature.
 *
 * @param {string} ua - User-Agent header value
 * @returns {boolean}
 */
export function isBotUserAgent(ua = '') {
  if (!ua) return false;
  const lower = ua.toLowerCase();
  return BOT_UA_PATTERNS.some((pattern) => lower.includes(pattern));
}

/**
 * Returns true if the request is authorized to receive real data.
 *
 * Rules (in order):
 *   1. If ?simulate_decoy=true query param is present → always unauthorized (for testing)
 *   2. If User-Agent matches a known bot signature    → unauthorized
 *   3. If ALLOWED_VISITOR_IP is set and IP mismatches → unauthorized
 *   4. Otherwise                                      → authorized
 *
 * @param {import('express').Request} req
 * @returns {boolean} true = show real data, false = show decoy data
 */
export function isAuthorizedVisitor(req) {
  // 1. Developer test mode
  if (req.query.simulate_decoy === 'true') return false;

  // 2. Bot / crawler user-agent check
  const ua = req.headers['user-agent'] || '';
  if (isBotUserAgent(ua)) return false;

  // 3. IP check (only when ALLOWED_VISITOR_IP is configured)
  const allowedIp = process.env.ALLOWED_VISITOR_IP || null;
  if (allowedIp) {
    const visitorIp = getVisitorIp(req);
    if (visitorIp.toLowerCase() !== allowedIp.toLowerCase()) return false;
  }

  return true;
}
