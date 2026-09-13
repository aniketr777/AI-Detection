import { Router } from 'express';
import {
  getBlogs,
  getBlogBySlug,
  getCrawlableFeed
} from '../controllers/blogController.js';

const router = Router();

// GET /api/blogs
router.get('/blogs', getBlogs);

// GET /api/blogs/crawlable (machine-readable for AI agents)
router.get('/blogs/crawlable', getCrawlableFeed);

// GET /api/blogs/:slug
router.get('/blogs/:slug', getBlogBySlug);

export default router;
