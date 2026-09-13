import { Router } from 'express';
import { getHome } from '../controllers/systemController.js';
import celebRoutes from './celebRoutes.js';
import systemRoutes from './systemRoutes.js';

const router = Router();

// Root route: GET /
router.get('/', getHome);

// API subroutes: /api/*
router.use('/api', celebRoutes);
router.use('/api', systemRoutes);

export default router;
