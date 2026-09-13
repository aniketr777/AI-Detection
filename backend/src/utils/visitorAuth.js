/**
 * Visitor Authorization Utility
 *
 * Determines whether a request comes from an authorized visitor or a
 * crawler/scraper that should receive decoy data instead of real content.
 *
 * Three signals are checked in order:
 *   1. Bot UA      — known crawler/scraper User-Agent signatures
 *   2. Origin      — browser API calls always carry Origin: <frontend-url>
 *                    Direct API scrapes / curl / AI chat browsing have no Origin
 *                    or a wrong one → decoy data
 *   3. IP Match    — optional ALLOWED_VISITOR_IP env var (not recommended for
 *                    public sites — use Origin check instead)
 *
 * Why Origin works better than IP:
 *   Every real user's browser, regardless of their IP, sends:
 *     Origin: https://your-frontend.vercel.app
 *   when making fetch() API calls from your React app.
 *   A crawler hitting /api/celebs directly sends NO Origin header.
 *   ChatGPT browsing sends: Origin: https://chat.openai.com  (wrong → decoy)
 */

// ─── OpenAI ───────────────────────────────────────────────────────────────────
// Docs: https://platform.openai.com/docs/gptbot
const OPENAI_PATTERNS = [
  'gptbot',           // GPTBot/1.2        — main training crawler
  'chatgpt-user',     // ChatGPT-User/1.0  — ChatGPT browse plugin / actions
  'oai-searchbot',    // OAI-SearchBot/1.0 — OpenAI search indexer
  'openai-searchbot', // alternate label seen in the wild
  'openai',           // catch-all for any openai-labelled bot
];

// ─── Anthropic / Claude ────────────────────────────────────────────────────────
// Docs: https://support.anthropic.com/en/articles/8896518-does-anthropic-crawl-the-web
const ANTHROPIC_PATTERNS = [
  'claudebot',        // ClaudeBot/1.0     — main Claude crawler
  'claude-web',       // Claude-Web/1.0    — Claude web search feature
  'anthropic-ai',     // anthropic-ai      — generic Anthropic identifier
  'anthropicbot',     // seen in some logs
];

// ─── Google AI ────────────────────────────────────────────────────────────────
const GOOGLE_AI_PATTERNS = [
  'google-extended',  // Google AI training opt-out bot
  'googleother',      // Google undisclosed/experimental crawler
  'google-cloudvertexbot', // Vertex AI crawler
  'googlebot',        // main Google Search bot
  'googlebot-image',
  'googlebot-video',
  'googlebot-news',
  'storebot-google',
  'google-read-aloud',
  'apis-google',
];

// ─── Meta / Facebook ──────────────────────────────────────────────────────────
const META_PATTERNS = [
  'meta-externalagent', // Meta AI training crawler (2024+)
  'facebookbot',
  'facebot',
  'facebookexternalhit',
];

// ─── Other AI & Research Crawlers ─────────────────────────────────────────────
const AI_CRAWLER_PATTERNS = [
  'perplexitybot',      // Perplexity AI crawler
  'perplexity-user',    // Perplexity browse action
  'cohere-ai',          // Cohere AI
  'coherebot',
  'youbot',             // You.com
  'diffbot',            // Diffbot AI
  'brightbot',
  'bytespider',         // ByteDance / TikTok AI
  'petalbot',           // Huawei Petal search
  'applebot',           // Apple Siri / Spotlight
  'applebot-extended',  // Apple AI training
];

// ─── Traditional Search Bots ──────────────────────────────────────────────────
const SEARCH_BOT_PATTERNS = [
  'bingbot',
  'msnbot',
  'slurp',              // Yahoo
  'duckduckbot',
  'baiduspider',
  'baidubot',
  'yandexbot',
  'yandex',
  'sogou',
  'exabot',
  'ia_archiver',        // Wayback Machine
  'archive.org_bot',
  'seznambot',
  'rogerbot',           // Moz
  'dotbot',             // OpenSiteExplorer
  'semrushbot',
  'ahrefsbot',
  'mj12bot',            // Majestic
];

// ─── Generic HTTP Clients & Scraping Tools ────────────────────────────────────
const SCRAPER_PATTERNS = [
  'python-requests',
  'python-httpx',
  'python-urllib',
  'go-http-client',
  'axios/',
  'node-fetch',
  'node-http',
  'undici',             // Node.js built-in fetch (undici)
  'curl/',
  'wget/',
  'scrapy',
  'httpie',
  'httpx',
  'java/',
  'okhttp',
  'libwww-perl',
  'lwp-trivial',
  'mechanize',
  'httpclient',
  'apache-httpclient',
  'postman',
  'insomnia',
  'paw/',
  'php-curl',
  'php/',
  'ruby',
  'got/',               // Node.js got library
  'superagent',
  'request/',
  'aiohttp',            // Python async HTTP
  'httplib2',
  'urllib3',
];

// Combined master list
const BOT_UA_PATTERNS = [
  ...OPENAI_PATTERNS,
  ...ANTHROPIC_PATTERNS,
  ...GOOGLE_AI_PATTERNS,
  ...META_PATTERNS,
  ...AI_CRAWLER_PATTERNS,
  ...SEARCH_BOT_PATTERNS,
  ...SCRAPER_PATTERNS,
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
 * @returns {{ isBot: boolean, matchedPattern: string|null }}
 */
export function isBotUserAgent(ua = '') {
  if (!ua) return { isBot: false, matchedPattern: null };
  const lower = ua.toLowerCase();
  const matched = BOT_UA_PATTERNS.find((pattern) => lower.includes(pattern));
  return { isBot: !!matched, matchedPattern: matched || null };
}

/**
 * Returns true if the request is authorized to receive real data.
 *
 * Rules (in order):
 *   1. ?simulate_decoy=true            → always decoy (developer test)
 *   2. Bot / scraper User-Agent        → decoy
 *   3. Origin header check             → if CLIENT_URL is set in env:
 *        - No Origin header            → direct API access (curl/bot) → decoy
 *        - Origin doesn't match        → wrong source (AI chat browse) → decoy
 *        - Origin matches              → legitimate browser call → real data
 *   4. Optional IP check (ALLOWED_VISITOR_IP) → extra layer, rarely needed
 *
 * @param {import('express').Request} req
 * @returns {boolean} true = real data, false = decoy data
 */
export function isAuthorizedVisitor(req) {
  // 1. Developer test mode
  if (req.query.simulate_decoy === 'true') return false;

  // 2. Bot / crawler user-agent check
  const ua = req.headers['user-agent'] || '';
  const { isBot, matchedPattern } = isBotUserAgent(ua);
  if (isBot) {
    console.log(`[Honeypot] Bot UA detected (pattern: "${matchedPattern}") → serving decoy data. UA: ${ua.slice(0, 120)}`);
    return false;
  }

  // 3. Origin header check
  //    All real browser fetch() calls from the React app carry:
  //      Origin: https://your-frontend.vercel.app
  //    Direct curl/bot/AI-chat-browse requests either:
  //      - Send no Origin header at all, OR
  //      - Send a completely different Origin (e.g. https://chat.openai.com)
  const clientUrl = (process.env.CLIENT_URL || '').replace(/\/$/, '').toLowerCase();
  if (clientUrl) {
    const requestOrigin = (req.headers['origin'] || '').replace(/\/$/, '').toLowerCase();

    if (!requestOrigin) {
      // No Origin header = direct API access (curl, Postman, bot)
      console.log(`[Honeypot] No Origin header on request to ${req.originalUrl} → serving decoy data.`);
      return false;
    }

    // Allow exact match OR localhost for local development
    const isLocalhost = requestOrigin.startsWith('http://localhost') || requestOrigin.startsWith('http://127.0.0.1');
    if (!isLocalhost && requestOrigin !== clientUrl) {
      console.log(`[Honeypot] Origin mismatch (got: "${requestOrigin}", expected: "${clientUrl}") → serving decoy data.`);
      return false;
    }
  }

  // 4. Optional IP check (set ALLOWED_VISITOR_IP only if you need an extra layer)
  const allowedIp = process.env.ALLOWED_VISITOR_IP || null;
  if (allowedIp) {
    const visitorIp = getVisitorIp(req);
    if (visitorIp.toLowerCase() !== allowedIp.toLowerCase()) {
      console.log(`[Honeypot] IP mismatch (visitor: ${visitorIp}, allowed: ${allowedIp}) → serving decoy data.`);
      return false;
    }
  }

  return true;
}
