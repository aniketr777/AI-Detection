import { Router } from 'express';
import { getHome } from '../controllers/systemController.js';
import { getLlmTxt } from '../controllers/blogController.js';
import celebRoutes from './celebRoutes.js';
import systemRoutes from './systemRoutes.js';
import blogRoutes from './blogRoutes.js';
import contentRoutes from './contentRoutes.js';

const router = Router();

// Root route: GET /
router.get('/', getHome);

// Standard AI Scraper discovery: GET /llms.txt
router.get('/llms.txt', getLlmTxt);

// Robots.txt explicitly allowing AI scrapers: GET /robots.txt
router.get('/robots.txt', (req, res) => {
  const robots = `User-agent: *
Allow: /

User-agent: GPTBot
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

# Direct AI Crawlers to structured knowledge feed
Sitemap: /api/blogs/crawlable
`;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.send(robots);
});

// API subroutes: /api/*
router.use('/api', celebRoutes);
router.use('/api', systemRoutes);
router.use('/api', blogRoutes);
router.use('/api', contentRoutes);

export default router;
