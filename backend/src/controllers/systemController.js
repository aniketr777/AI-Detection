import os from 'os';
import { parseUserAgent } from '../utils/userAgentParser.js';
import { formatUptime, bytesToMB } from '../utils/formatters.js';
import { config } from '../config/environment.js';

/**
 * Helper to inspect host physical network interfaces
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
 * Controller for Client & Server Machine Inspection + IP Security Mismatch Verification
 * GET /api/client-info
 */
export function getClientInfo(req, res) {
  try {
    // Ensure responses are never cached by browsers or proxy CDNs
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');

    // 1. Extract Client IP with support for all major cloud providers
    const forwardedFor = req.headers['x-forwarded-for'];
    const rawClientIp =
      (forwardedFor ? forwardedFor.split(',')[0].trim() : null) ||
      req.headers['x-real-ip'] ||
      req.headers['cf-connecting-ip'] ||
      req.headers['true-client-ip'] ||
      req.socket?.remoteAddress ||
      req.ip ||
      '127.0.0.1';

    // Normalize IPv6 prefix & clean IP
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

    // 5. Host Network Interfaces & Physical Device IP Detection
    const hostInterfaces = getHostNetworkDetails();
    const nonInternalHostIps = hostInterfaces
      .filter((i) => !i.internal && (i.family === 'IPv4' || i.family === 4))
      .map((i) => i.address);

    const primaryHostIp =
      process.env.PRIMARY_DEVICE_IP || nonInternalHostIps[0] || '127.0.0.1';

    // Verification: Does the requester IP match the physical host machine?
    const isLoopback =
      cleanClientIp === '127.0.0.1' ||
      cleanClientIp === '::1' ||
      cleanClientIp === 'localhost';

    const matchesHostInterface = hostInterfaces.some(
      (i) => i.address.toLowerCase() === cleanClientIp.toLowerCase()
    );

    const matchesConfiguredIp = process.env.PRIMARY_DEVICE_IP
      ? cleanClientIp.toLowerCase() === process.env.PRIMARY_DEVICE_IP.toLowerCase()
      : false;

    // Support test simulation via query param ?simulate_remote=true
    const simulatedRemote = req.query.simulate_remote === 'true';

    const isPhysicalHostDevice =
      !simulatedRemote &&
      (isLoopback || matchesHostInterface || matchesConfiguredIp);

    const securityNotification = {
      isPhysicalHostDevice,
      mismatchDetected: !isPhysicalHostDevice,
      clientIp: cleanClientIp,
      primaryPhysicalIp: primaryHostIp,
      availableHostIps: nonInternalHostIps,
      alertType: isPhysicalHostDevice ? 'DEVICE_MATCH' : 'REMOTE_DEVICE_MISMATCH',
      alertLevel: isPhysicalHostDevice ? 'safe' : 'warning',
      simulated: simulatedRemote,
      title: isPhysicalHostDevice
        ? 'Physical Device Verified'
        : '⚠️ External / Remote Device Access Alert',
      message: isPhysicalHostDevice
        ? `Request originated from the physical host machine (${cleanClientIp}).`
        : `Access detected from a different device! Requester IP (${cleanClientIp}) does not match the physical device IP (${primaryHostIp}).`
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
      primaryPhysicalIp: primaryHostIp
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
