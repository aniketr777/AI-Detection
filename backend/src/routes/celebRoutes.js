import { Router } from 'express';
import { getCelebrities } from '../controllers/celebController.js';

const router = Router();

// GET /api/celebs
router.get('/celebs', getCelebrities);

export default router;
