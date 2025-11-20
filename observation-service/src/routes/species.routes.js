import express from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import {
  createSpecies,
  getSpeciesById,
  getAllSpecies
} from '../controllers/species.controller.js';
import { getObservationsBySpecies } from '../controllers/observation.controller.js';

const router = express.Router();

// POST /api/species - Créer une nouvelle espèce (authentifié)
router.post('/', authMiddleware, createSpecies);

// GET /api/species/:id - Récupérer une espèce par ID (authentifié)
router.get('/:id', authMiddleware, getSpeciesById);

// GET /api/species - Récupérer toutes les espèces (authentifié)
router.get('/', authMiddleware, getAllSpecies);

// GET /api/species/:id/observations - Récupérer les observations d'une espèce
router.get('/:id/observations', authMiddleware, getObservationsBySpecies);

export default router;
