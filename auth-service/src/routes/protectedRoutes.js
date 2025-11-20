const express = require('express');
const { getAllUsers, updateUserRole, updateReput } = require('../controllers/adminController');
const { requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * GET /admin/users
 * Récupérer tous les utilisateurs (ADMIN uniquement)
 */
router.get('/admin/users', requireRole('ADMIN'), getAllUsers);

/**
 * PATCH /users/:id/role
 * Modifier le rôle d'un utilisateur (ADMIN uniquement)
 */
router.patch('/users/:id/role', requireRole('ADMIN'), updateUserRole);

/**
 * PATCH /users/:id/reputation
 * Modifier la réputation d'un utilisateur (ADMIN uniquement)
 * En renseignant dans le body le score à ajouter (+) ou enlever (-)
*/
router.patch('/users/:id/reputation', requireRole('ADMIN'), updateReput);

module.exports = router;