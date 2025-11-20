const User = require('../model/user');
const mongoose = require('mongoose');

/**
 * GET /admin/users
 * Récupérer tous les utilisateurs (ADMIN uniquement)
 */
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        
        res.status(200).json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Erreur lors de la récupération des utilisateurs'
        });
    }
};

/**
 * PATCH /users/:id/role
 * Modifier le rôle d'un utilisateur (ADMIN uniquement)
 */
const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        // Valider que l'ID est un ObjectId valide
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID utilisateur invalide'
            });
        }

        if (!role || !['USER', 'EXPERT', 'ADMIN'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Le rôle doit être USER, EXPERT ou ADMIN'
            });
        }

        const user = await User.findByIdAndUpdate(
            id,
            { role },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Rôle de l\'utilisateur mis à jour avec succès',
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                role: user.role,
                reputation: user.reputation,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du rôle:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Erreur lors de la mise à jour du rôle'
        });
    }
};

const updateReput = async(req, res) => {
    const { id } = req.params;
    const { reputation } = req.body;

    try {
        const user = await User.findByIdAndUpdate(
            id,
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        const reput_user = parseInt(user.reputation) + parseInt(reputation);

        user.reputation = reput_user;

        if (user.reputation >= 10) {
            user.role = 'EXPERT';
        } else if (user.reputation < 10 && user.role === 'EXPERT') {
            user.role = 'USER';
        }
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Réputation de l\'utilisateur mise à jour avec succès',
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                role: user.role,
                reputation: user.reputation,
            }
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la réputation:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Erreur lors de la mise à jour de la réputation'
        });
    }
};

module.exports = {
    getAllUsers,
    updateUserRole,
    updateReput
};
