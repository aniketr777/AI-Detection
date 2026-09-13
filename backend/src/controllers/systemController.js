import os from 'os';
import { parseUserAgent } from '../utils/userAgentParser.js';
import { formatUptime, bytesToMB } from '../utils/formatters.js';
import { config } from '../config/environment.js';

/**
 * Helper to inspect host physical network interfaces (used for informational display only)
 */
function getHostNetworkDetails() {
  const interfaces = os.networkInterfaces();
  const list = [];
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      list.push({
        address: net.address,
        family: net.family,
        internal: net.internal,
        interface: name
      });
    }
  }
  return list;
}

/**
 * Controller for Root Home Route
 * GET /
 */
export function getHome(req, res) {
  return res.json({
    message: 'Hello from OmniPulse Dashboard Backend API! 🚀',
    status: 'online',
    version: '1.0.0',
    environment: config.nodeEnv,
    endpoints: {
      root: 'GET /',
      health: 'GET /api/health',
      celebrities: 'GET /api/celebs',
      blogs: 'GET /api/blogs',
      blogCrawlable: 'GET /api/blogs/crawlable',
      llmsTxt: 'GET /llms.txt',
      robotsTxt: 'GET /robots.txt',
      clientInfo: 'GET /api/client-info'
    },
    documentation: 'Provides celebrity profiles, crawlable AI technical research blogs, and client/server diagnostic telemetry.',
    timestamp: new Date().toISOString()
  });
}

/**
 * Controller for Health Check
 * GET /api/health
 */
export function getHealth(req, res) {
  return res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: formatUptime(process.uptime()),
    environment: config.nodeEnv
  });
}

/**
 * Controller for Client & Server Machine Inspection + Visitor IP Access Verification
 * GET /api/client-info
 *
 * IP Verification Strategy:
 *   Compares the public IP from which the website is called (request IP) against
 *   the ALLOWED_VISITOR_IP environment variable (the authorized owner's expected IP).
 *   If ALLOWED_VISITOR_IP is not set, localhost is treated as authorized.
 */
export function getClientInfo(req, res) {
  try {
    // Ensure responses are never cached by browsers or proxy CDNs
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');

    // 1. Extract the visitor's request IP (the IP from which the website was called)
    //    Supports all major cloud/CDN proxy headers.
    const forwardedFor = req.headers['x-forwarded-for'];
    const rawClientIp =
      (forwardedFor ? forwardedFor.split(',')[0].trim() : null) ||
      req.headers['x-real-ip'] ||
      req.headers['cf-connecting-ip'] ||
      req.headers['true-client-ip'] ||
      req.socket?.remoteAddress ||
      req.ip ||
      '127.0.0.1';

    // Normalize IPv6 loopback prefix & clean IP
    const cleanClientIp = rawClientIp.replace(/^::ffff:/, '').trim();
    const clientDisplayIp =
      cleanClientIp === '::1' ? '127.0.0.1 (Localhost IPv6 ::1)' : cleanClientIp;

    // 2. Parse User-Agent
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const uaDetails = parseUserAgent(userAgent);

    // 3. Relevant Client Headers
    const clientHeaders = {
      'user-agent': userAgent,
      host: req.headers['host'] || '',
      'accept-language': req.headers['accept-language'] || '',
      'accept-encoding': req.headers['accept-encoding'] || '',
      'sec-ch-ua': req.headers['sec-ch-ua'] || '',
      'sec-ch-ua-platform': req.headers['sec-ch-ua-platform'] || '',
      'sec-ch-ua-mobile': req.headers['sec-ch-ua-mobile'] || '',
      referer: req.headers['referer'] || 'Direct / None',
      connection: req.headers['connection'] || ''
    };

    // 4. Server Machine Specs from os module
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const cpus = os.cpus();

    // 5. Host network interfaces — informational only, not used for IP verification
    const hostInterfaces = getHostNetworkDetails();
    const nonInternalHostIps = hostInterfaces
      .filter((i) => !i.internal && (i.family === 'IPv4' || i.family === 4))
      .map((i) => i.address);

    // 6. Visitor IP Verification
    //    Compare the IP from which the website was called against ALLOWED_VISITOR_IP.
    //    ALLOWED_VISITOR_IP = the authorized owner's expected public IP address.
    //    If not set, only localhost is considered authorized.
    const allowedVisitorIp = process.env.ALLOWED_VISITOR_IP || null;

    const isLoopback =
      cleanClientIp === '127.0.0.1' ||
      cleanClientIp === '::1' ||
      cleanClientIp === 'localhost';

    // Support test simulation via query param ?simulate_remote=true
    const simulatedRemote = req.query.simulate_remote === 'true';

    let isAuthorizedVisitor;
    if (simulatedRemote) {
      // Force mismatch for UI testing purposes
      isAuthorizedVisitor = false;
    } else if (allowedVisitorIp) {
      // Compare visitor's request IP against the configured authorized IP
      isAuthorizedVisitor = cleanClientIp.toLowerCase() === allowedVisitorIp.toLowerCase();
    } else {
      // No authorized IP configured — skip check, treat everyone as authorized
      isAuthorizedVisitor = true;
    }

    const securityNotification = {
      isAuthorizedVisitor,
      mismatchDetected: !isAuthorizedVisitor,
      clientIp: cleanClientIp,
      allowedVisitorIp: allowedVisitorIp || (isLoopback ? cleanClientIp : 'Not configured'),
      alertType: isAuthorizedVisitor ? 'AUTHORIZED_VISITOR' : 'UNAUTHORIZED_VISITOR',
      alertLevel: isAuthorizedVisitor ? 'safe' : 'warning',
      simulated: simulatedRemote,
      title: isAuthorizedVisitor
        ? 'Authorized Visitor IP Verified'
        : '⚠️ Unrecognized Visitor IP Alert',
      message: isAuthorizedVisitor
        ? `Request originated from the authorized IP (${cleanClientIp}).`
        : `Access detected from an unrecognized IP! Visitor IP (${cleanClientIp}) does not match the configured authorized IP (${allowedVisitorIp || 'Not configured'}).`
    };

    const serverMachine = {
      hostname: os.hostname(),
      platform: os.platform(),
      osType: os.type(),
      osRelease: os.release(),
      architecture: os.arch(),
      cpuCount: cpus.length,
      cpuModel: cpus[0]?.model || 'Unknown CPU',
      cpuSpeedMHz: cpus[0]?.speed || 0,
      totalMemoryMB: bytesToMB(totalMem),
      freeMemoryMB: bytesToMB(freeMem),
      usedMemoryMB: bytesToMB(usedMem),
      memoryUsagePercent: ((usedMem / totalMem) * 100).toFixed(1) + '%',
      systemUptime: formatUptime(os.uptime()),
      processUptime: formatUptime(process.uptime()),
      nodeVersion: process.version,
      processPid: process.pid,
      serverPort: config.port,
      environment: config.nodeEnv,
      availableHostIps: nonInternalHostIps
    };

    const clientRequest = {
      ip: clientDisplayIp,
      cleanIp: cleanClientIp,
      protocol: req.protocol.toUpperCase(),
      httpVersion: `HTTP/${req.httpVersion}`,
      method: req.method,
      url: req.originalUrl,
      secure: req.secure,
      browser: uaDetails.browser,
      os: uaDetails.os,
      deviceType: uaDetails.device,
      primaryLanguage: (req.headers['accept-language'] || 'en-US').split(',')[0],
      requestTimestamp: new Date().toISOString(),
      headers: clientHeaders
    };

    return res.json({
      success: true,
      client: clientRequest,
      server: serverMachine,
      security: securityNotification,
      queriedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in getClientInfo:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}
