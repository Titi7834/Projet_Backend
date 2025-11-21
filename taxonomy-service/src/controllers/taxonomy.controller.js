import { generateTaxonomyStats } from '../services/taxonomy.service.js';

/**
 * Récupère les statistiques taxonomiques complètes
 * GET /api/taxonomy/stats
 */
export const getTaxonomyStats = async (req, res) => {
  try {
    // Extraire le token JWT de la requête
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Token JWT requis' });
    }
    
    // Passer le token au service pour les appels inter-services
    const stats = await generateTaxonomyStats(token);
    
    return res.status(200).json(stats);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return res.status(500).json({ 
      error: 'Erreur lors de la génération des statistiques taxonomiques',
      details: error.message 
    });
  }
};
