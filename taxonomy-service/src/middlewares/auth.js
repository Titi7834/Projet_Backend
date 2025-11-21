import jwt from 'jsonwebtoken';

/**
 * Middleware d'authentification JWT
 */
export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token non fourni' });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Token invalide ou expiré' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Erreur d\'authentification' });
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
