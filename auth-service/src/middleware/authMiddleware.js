const jwt = require('jsonwebtoken');
const User = require('../model/user');

require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Middleware d'authentification
 * Vérifie le JWT token et ajoute les infos utilisateur à req.user
 */
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'Authorization header manquant'
            });
        }

        const [type, token] = authHeader.split(' ');
        
        if (type !== 'Bearer' || !token) {
            return res.status(401).json({
                success: false,
                message: 'Format du header Authorization invalide. Utilisez: Bearer <token>'
            });
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            
            const user = await User.findById(decoded.userId);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Utilisateur non trouvé'
                });
            }

            req.user = {
                userId: user._id,
                email: user.email,
                username: user.username,
                role: user.role
            };

            next();
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token expiré'
                });
            }
            throw err;
        }
    } catch (error) {
        console.error('Erreur d\'authentification:', error);
        return res.status(401).json({
            success: false,
            message: 'Token invalide ou expiré'
        });
    }
};

/**
 * Middleware pour vérifier les rôles
 * @param {...string} allowedRoles - Les rôles autorisés
 */
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Utilisateur non authentifié'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Accès refusé. Rôles autorisés: ${allowedRoles.join(', ')}`
            });
        }

        next();
    };
};

module.exports = {
    authMiddleware,
    requireRole
};
