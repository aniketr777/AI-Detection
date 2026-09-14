import { Router } from 'express';
import { getContent } from '../controllers/contentController.js';
import rateLimit from 'express-rate-limit';

const router = Router();

// Basic rate limiting for the content endpoint
const contentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// POST /api/content
router.post('/content', contentLimiter, getContent);

export default router;
