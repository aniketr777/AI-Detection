import os from 'os';
import { parseUserAgent } from '../utils/userAgentParser.js';
import { formatUptime, bytesToMB } from '../utils/formatters.js';
import { config } from '../config/environment.js';

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
      clientInfo: 'GET /api/client-info'
    },
    documentation: 'Provides celebrity profiles and client/server diagnostic telemetry.',
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
 * Controller for Client & Server Machine Inspection
 * GET /api/client-info
 */
export function getClientInfo(req, res) {
  try {
    // 1. Extract Client IP
    const forwardedFor = req.headers['x-forwarded-for'];
    const rawClientIp = forwardedFor
      ? forwardedFor.split(',')[0].trim()
      : req.socket.remoteAddress || req.ip || '127.0.0.1';

    // Normalize IPv6 localhost
    const clientIp =
      rawClientIp === '::1' ? '127.0.0.1 (Localhost IPv6 ::1)' : rawClientIp;

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
      environment: config.nodeEnv
    };

    const clientRequest = {
      ip: clientIp,
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
      queriedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in getClientInfo:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}
