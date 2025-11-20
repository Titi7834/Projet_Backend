const jwt = require('jsonwebtoken');
const User = require('../model/user');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Générer un JWT token
 */
const generateToken = (userId) => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * POST /auth/register
 * Créer un nouvel utilisateur
 */
const register = async (req, res) => {
    try {
        const { email, username, password, role } = req.body;

        if (!email || !username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email, username et password sont obligatoires'
            });
        }

        const existingUser = await User.findByEmailOrUsername(email);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Cet email ou nom d\'utilisateur est déjà utilisé'
            });
        }

        const newUser = new User({
            email,
            username,
            password,
            role: role && ['USER', 'EXPERT', 'ADMIN'].includes(role) ? role : 'USER'
        });

        await newUser.save();

        const token = generateToken(newUser._id);

        res.status(201).json({
            success: true,
            message: 'Utilisateur créé avec succès',
            token,
            user: {
                id: newUser._id,
                email: newUser.email,
                username: newUser.username,
                role: newUser.role,
                reputation: newUser.reputation,
                createdAt: newUser.createdAt
            }
        });
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Erreur lors de l\'enregistrement'
        });
    }
};

/**
 * POST /auth/login
 * Authentifier un utilisateur
 */
const login = async (req, res) => {
    try {
        const { email, username, password } = req.body;

        const identifier = email || username;

        if (!identifier || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email/username et password sont obligatoires'
            });
        }

        const user = await User.findByEmailOrUsername(identifier).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Email/username ou mot de passe incorrect'
            });
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Email/username ou mot de passe incorrect'
            });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Connexion réussie',
            token,
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
        console.error('Erreur lors de la connexion:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Erreur lors de la connexion'
        });
    }
};

/**
 * GET /auth/me
 * Récupérer les infos de l'utilisateur connecté
 */
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        res.status(200).json({
            success: true,
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
        console.error('Erreur lors de la récupération des infos:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Erreur lors de la récupération des infos'
        });
    }
};

module.exports = {
    register,
    login,
    getMe,
    generateToken
};
