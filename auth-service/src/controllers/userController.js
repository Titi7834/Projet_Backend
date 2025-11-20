const User = require('../model/user');

/**
 * PATCH /api/users/:id/reputation
 * Met à jour la réputation d'un utilisateur
 */
const updateUserReputation = async (req, res) => {
    try {
        const { id } = req.params;
        const { points } = req.body;

        if (points === undefined || typeof points !== 'number') {
            return res.status(400).json({
                success: false,
                message: 'Le nombre de points est requis et doit être un nombre'
            });
        }

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        // Mettre à jour la réputation
        user.reputation += points;
        
        // S'assurer que la réputation ne descend pas en dessous de 0
        if (user.reputation < 0) {
            user.reputation = 0;
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Réputation mise à jour',
            reputation: user.reputation,
            role: user.role,
            userId: user._id
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
    updateUserReputation
};
