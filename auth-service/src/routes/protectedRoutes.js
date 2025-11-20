const express = require('express');
const { getAllUsers, updateUserRole } = require('../controllers/adminController');
const { updateUserReputation } = require('../controllers/userController');
const { requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * GET /admin/users
 * Récupérer tous les utilisateurs (ADMIN uniquement)
 */
router.get('/admin/users', requireRole('ADMIN'), getAllUsers);

/**
 * PATCH /users/:id/role
 * Modifier le rôle d'un utilisateur (ADMIN ou service interne)
 */
router.patch('/users/:id/role', updateUserRole);

/**
 * PATCH /users/:id/reputation
 * Modifier la réputation d'un utilisateur (accessible aux microservices)
 */
router.patch('/users/:id/reputation', updateUserReputation);

module.exports = router;