const express = require('express');
const { getAllUsers, updateUserRole } = require('../controllers/adminController');
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

module.exports = router;

module.exports = router;
