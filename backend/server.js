import express from 'express';
import cors from 'cors';
import os from 'os';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Helper to parse User-Agent
function parseUserAgent(ua = '') {
  let browser = 'Unknown Browser';
  let osName = 'Unknown OS';
  let device = 'Desktop';

  if (/mobile/i.test(ua)) device = 'Mobile';
  else if (/tablet|ipad/i.test(ua)) device = 'Tablet';

  if (/windows nt 10.0/i.test(ua)) osName = 'Windows 10 / 11';
  else if (/windows nt 6.3/i.test(ua)) osName = 'Windows 8.1';
  else if (/windows nt 6.1/i.test(ua)) osName = 'Windows 7';
  else if (/macintosh|mac os x/i.test(ua)) osName = 'macOS';
  else if (/iphone|ipad|ipod/i.test(ua)) osName = 'iOS';
  else if (/android/i.test(ua)) osName = 'Android';
  else if (/linux/i.test(ua)) osName = 'Linux';

  if (/edg\//i.test(ua)) browser = 'Microsoft Edge';
  else if (/opr\/|opera/i.test(ua)) browser = 'Opera';
  else if (/chrome|crios/i.test(ua)) browser = 'Google Chrome';
  else if (/firefox|fxios/i.test(ua)) browser = 'Mozilla Firefox';
  else if (/safari/i.test(ua)) browser = 'Apple Safari';

  return { browser, os: osName, device };
}

// Popular Celebrities Data
const CELEBRITIES = [
  {
    id: 'keanu-reeves',
    name: 'Keanu Reeves',
    category: 'Film & TV',
    role: 'Actor & Producer',
    nationality: 'Canadian',
    birthYear: 1964,
    netWorth: '$380 Million',
    socialFollowers: '12M+ (Fan Communities)',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
    bio: 'Beloved international film star known for iconic franchises like The Matrix and John Wick, celebrated for his humility and philanthropic generosity.',
    notableWorks: ['The Matrix Trilogy', 'John Wick Franchise', 'Speed', 'Constantine'],
    awards: ['Walk of Fame Star', 'BAMBI Award', 'CinemaCon Pioneer of the Year'],
    quote: 'The simple act of paying attention can take you a long way.',
    tags: ['Action Star', 'Iconic', 'Philanthropist']
  },
  {
    id: 'zendaya',
    name: 'Zendaya Coleman',
    category: 'Film & TV',
    role: 'Actress & Fashion Icon',
    nationality: 'American',
    birthYear: 1996,
    netWorth: '$22 Million',
    socialFollowers: '184M+',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    bio: 'Two-time Primetime Emmy Award-winning actress celebrated for Euphoria, Dune, and Spider-Man, as well as being a global trendsetting fashion ambassador.',
    notableWorks: ['Euphoria', 'Dune: Part One & Two', 'Spider-Man: No Way Home', 'Challengers'],
    awards: ['2x Primetime Emmy Award', 'Golden Globe Award', 'Critics Choice Award'],
    quote: 'There are so many great things in life; why not have that ambition for yourself?',
    tags: ['Emmy Winner', 'Dune', 'Global Ambassador']
  },
  {
    id: 'shah-rukh-khan',
    name: 'Shah Rukh Khan',
    category: 'Film & TV',
    role: 'Actor & Film Producer',
    nationality: 'Indian',
    birthYear: 1965,
    netWorth: '$870 Million',
    socialFollowers: '150M+ Across Platforms',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80',
    bio: 'Known as "King Khan" and the "Baadshah of Bollywood", he has appeared in over 90 films and is recognized as one of the most successful cinematic icons in the world.',
    notableWorks: ['Dilwale Dulhania Le Jayenge', 'Jawan', 'Pathaan', 'My Name Is Khan'],
    awards: ['14 Filmfare Awards', 'Padma Shri', 'Ordre des Arts et des Lettres'],
    quote: 'Success is not a good teacher, failure makes you humble.',
    tags: ['King of Bollywood', 'Global Megastar', 'Producer']
  },
  {
    id: 'taylor-swift',
    name: 'Taylor Swift',
    category: 'Music',
    role: 'Singer-Songwriter & Producer',
    nationality: 'American',
    birthYear: 1989,
    netWorth: '$1.3 Billion',
    socialFollowers: '280M+',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
    bio: 'Cultural phenomenon and history-making music artist who became the first artist to win four Album of the Year Grammys with record-shattering global stadium tours.',
    notableWorks: ['1989 (Taylor\'s Version)', 'Folklore', 'Midnights', 'The Eras Tour'],
    awards: ['14 Grammy Awards', '40 American Music Awards', 'TIME Person of the Year'],
    quote: 'No matter what happens in life, be good to people. Being good to people is a wonderful legacy.',
    tags: ['Grammy Record Holder', 'Billionaire Artist', 'Songwriter']
  },
  {
    id: 'cristiano-ronaldo',
    name: 'Cristiano Ronaldo',
    category: 'Sports',
    role: 'Professional Footballer',
    nationality: 'Portuguese',
    birthYear: 1985,
    netWorth: '$600 Million',
    socialFollowers: '640M+ (Most followed on Instagram)',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80',
    bio: 'Widely considered one of the greatest football players in history, with over 900 official career goals, 5 Ballon d\'Or titles, and unprecedented social media reach.',
    notableWorks: ['UEFA Champions League (5x)', 'Real Madrid All-time Top Scorer', 'Euro 2016 Champion'],
    awards: ['5x Ballon d\'Or', '4x European Golden Shoe', 'FIFA The Best Men\'s Player'],
    quote: 'Your love makes me strong, your hate makes me unstoppable.',
    tags: ['Football GOAT', 'Ballon d\'Or', 'Global Influencer']
  },
  {
    id: 'margot-robbie',
    name: 'Margot Robbie',
    category: 'Film & TV',
    role: 'Actress & Producer',
    nationality: 'Australian',
    birthYear: 1990,
    netWorth: '$60 Million',
    socialFollowers: '30M+ (Online Reach)',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80',
    bio: 'Acclaimed Australian actress and powerhouse producer behind LuckyChap Entertainment, commanding worldwide box offices with Barbie, I, Tonya, and Birds of Prey.',
    notableWorks: ['Barbie', 'The Wolf of Wall Street', 'I, Tonya', 'Babylon'],
    awards: ['3 Academy Award Nominations', 'Golden Globe Producer Award', 'BAFTA Nominee'],
    quote: 'If you want something done, you gotta do it yourself.',
    tags: ['Producer', 'Barbie', 'LuckyChap']
  }
];

// Helper to format uptime
function formatUptime(seconds) {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(' ');
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: formatUptime(process.uptime())
  });
});

// Celebs endpoint
app.get('/api/celebs', (req, res) => {
  const { category, search } = req.query;
  let list = CELEBRITIES;

  if (category && category !== 'All') {
    list = list.filter(c => c.category.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.role.toLowerCase().includes(q) ||
      c.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  res.json({
    total: list.length,
    celebrities: list
  });
});

// Client & Server info endpoint
app.get('/api/client-info', (req, res) => {
  // Extract Client info from the incoming HTTP request
  const forwardedFor = req.headers['x-forwarded-for'];
  const rawClientIp = forwardedFor
    ? forwardedFor.split(',')[0].trim()
    : (req.socket.remoteAddress || req.ip || '127.0.0.1');

  // Normalize IPv6 localhost
  const clientIp = rawClientIp === '::1' ? '127.0.0.1 (Localhost IPv6 ::1)' : rawClientIp;
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const uaDetails = parseUserAgent(userAgent);

  // Extract relevant client headers
  const clientHeaders = {
    'user-agent': userAgent,
    'host': req.headers['host'] || '',
    'accept-language': req.headers['accept-language'] || '',
    'accept-encoding': req.headers['accept-encoding'] || '',
    'sec-ch-ua': req.headers['sec-ch-ua'] || '',
    'sec-ch-ua-platform': req.headers['sec-ch-ua-platform'] || '',
    'sec-ch-ua-mobile': req.headers['sec-ch-ua-mobile'] || '',
    'referer': req.headers['referer'] || 'Direct / None',
    'connection': req.headers['connection'] || ''
  };

  // Extract Server / Host machine info using os module
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
    totalMemoryMB: Math.round(totalMem / (1024 * 1024)),
    freeMemoryMB: Math.round(freeMem / (1024 * 1024)),
    usedMemoryMB: Math.round(usedMem / (1024 * 1024)),
    memoryUsagePercent: ((usedMem / totalMem) * 100).toFixed(1) + '%',
    systemUptime: formatUptime(os.uptime()),
    processUptime: formatUptime(process.uptime()),
    nodeVersion: process.version,
    processPid: process.pid,
    serverPort: PORT,
    environment: process.env.NODE_ENV || 'development'
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

  res.json({
    success: true,
    client: clientRequest,
    server: serverMachine,
    queriedAt: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
