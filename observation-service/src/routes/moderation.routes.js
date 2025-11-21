import express from 'express';
import { authMiddleware, isAdmin, isExpertOrAdmin } from '../middlewares/auth.js';
import { 
  softDeleteObservation, 
  restoreObservation,
  getAdminUserHistory,
  getExpertSpeciesHistory,
  softDeleteSpecies
} from '../controllers/moderation.controller.js';

const router = express.Router();

// Routes ADMIN
router.delete('/admin/observations/:id', authMiddleware, isAdmin, softDeleteObservation);
router.post('/admin/observations/:id/restore', authMiddleware, isAdmin, restoreObservation);
router.get('/admin/users/:id/history', authMiddleware, isAdmin, getAdminUserHistory);
router.delete('/admin/species/:id', authMiddleware, isAdmin, softDeleteSpecies);

// Routes EXPERT
router.get('/expert/species/:id/history', authMiddleware, isExpertOrAdmin, getExpertSpeciesHistory);

export default router;
