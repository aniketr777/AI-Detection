import { Router } from 'express';
import { getHealth, getClientInfo } from '../controllers/systemController.js';

const router = Router();

// GET /api/health
router.get('/health', getHealth);

// GET /api/client-info
router.get('/client-info', getClientInfo);

export default router;
