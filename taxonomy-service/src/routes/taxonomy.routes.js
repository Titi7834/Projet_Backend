import express from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import { getTaxonomyStats } from '../controllers/taxonomy.controller.js';

const router = express.Router();

// GET /api/taxonomy/stats - Récupérer les statistiques taxonomiques
router.get('/stats', authMiddleware, getTaxonomyStats);

export default router;
