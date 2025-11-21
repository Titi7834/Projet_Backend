import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3000';

/**
 * Middleware d'authentification JWT
 * Vérifie le token et récupère l'utilisateur depuis l'auth-service
 */
export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        error: 'Token manquant ou invalide' 
      });
    }

    const token = authHeader.substring(7);
    
    // Vérifier le token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Récupérer les infos utilisateur depuis auth-service
    try {
      const response = await fetch(`${AUTH_SERVICE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        return res.status(401).json({ 
          success: false,
          error: 'Utilisateur non trouvé' 
        });
      }

      req.user = decoded;
      next();

    } catch (fetchError) {
      console.error('Erreur lors de la récupération utilisateur:', fetchError);
      return res.status(500).json({ 
        success: false,
        error: 'Erreur de communication avec auth-service' 
      });
    }
  } catch (error) {
    return res.status(401).json({ 
      success: false,
      error: 'Token invalide ou expiré' 
    });
  }
};

/**
 * Middleware pour vérifier le rôle EXPERT ou ADMIN
 */
export const isExpertOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  if (req.user.role !== 'EXPERT' && req.user.role !== 'ADMIN') {
    return res.status(403).json({ 
      error: 'Accès refusé. Rôle EXPERT ou ADMIN requis.' 
    });
  }

  next();
};

/**
 * Middleware pour vérifier le rôle ADMIN
 */
export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ 
      error: 'Accès refusé. Rôle ADMIN requis.' 
    });
  }

  next();
};
