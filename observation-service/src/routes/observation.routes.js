import express from 'express';
import { authMiddleware, requireExpert } from '../middlewares/auth.js';
import {
  createObservation,
  validateObservation,
  rejectObservation
} from '../controllers/observation.controller.js';

const router = express.Router();

// POST /api/observations - Créer une nouvelle observation (authentifié)
router.post('/', authMiddleware, createObservation);

// POST /api/observations/:id/validate - Valider une observation (EXPERT ou ADMIN)
router.post('/:id/validate', authMiddleware, requireExpert, validateObservation);

// POST /api/observations/:id/reject - Rejeter une observation (EXPERT ou ADMIN)
router.post('/:id/reject', authMiddleware, requireExpert, rejectObservation);

export default router;
