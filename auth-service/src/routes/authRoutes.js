const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * POST /auth/register
 * Créer un nouvel utilisateur
 */
router.post('/register', register);

/**
 * POST /auth/login
 * Authentifier un utilisateur
 */
router.post('/login', login);

/**
 * GET /auth/me
 * Récupérer les infos de l'utilisateur connecté
 */
router.get('/me', authMiddleware, getMe);

module.exports = router;
