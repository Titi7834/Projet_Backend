import { Observation } from '../models/Observation.js';
import { Species } from '../models/Species.js';
import { recordHistory } from '../services/history.service.js';
import { getUserHistory, getSpeciesHistory } from '../services/history.service.js';
import { HistoryAction } from '../models/History.js';

/**
 * Supprime logiquement une observation (ADMIN uniquement)
 * DELETE /api/admin/observations/:id
 */
export const softDeleteObservation = async (req, res) => {
  try {
    const { id } = req.params;

    const observation = await Observation.findById(id);

    if (!observation) {
      return res.status(404).json({ error: 'Observation non trouvée' });
    }

    if (observation.deletedAt) {
      return res.status(400).json({ 
        error: 'Cette observation a déjà été supprimée' 
      });
    }

    // Marquer comme supprimée
    observation.deletedAt = new Date();
    observation.deletedBy = req.user.id;
    await observation.save();

    // Enregistrer dans l'historique
    await recordHistory(
      HistoryAction.DELETED,
      req.user.id,
      req.user.role,
      'observation',
      observation._id.toString(),
      {
        description: observation.description,
        status: observation.status,
        authorId: observation.authorId
      }
    );

    return res.status(200).json({
      message: 'Observation supprimée avec succès',
      id: observation._id,
      deletedAt: observation.deletedAt,
      deletedBy: observation.deletedBy
    });
  } catch (error) {
    console.error('Erreur suppression observation:', error);
    return res.status(500).json({ error: 'Erreur lors de la suppression de l\'observation' });
  }
};

/**
 * Restaure une observation supprimée (ADMIN uniquement)
 * POST /api/admin/observations/:id/restore
 */
export const restoreObservation = async (req, res) => {
  try {
    const { id } = req.params;

    const observation = await Observation.findById(id);

    if (!observation) {
      return res.status(404).json({ error: 'Observation non trouvée' });
    }

    if (!observation.deletedAt) {
      return res.status(400).json({ 
        error: 'Cette observation n\'est pas supprimée' 
      });
    }

    // Restaurer l'observation
    observation.deletedAt = null;
    observation.deletedBy = null;
    await observation.save();

    // Enregistrer dans l'historique
    await recordHistory(
      HistoryAction.RESTORED,
      req.user.id,
      req.user.role,
      'observation',
      observation._id.toString(),
      {
        description: observation.description,
        status: observation.status
      }
    );

    return res.status(200).json({
      message: 'Observation restaurée avec succès',
      id: observation._id,
      speciesId: observation.speciesId,
      authorId: observation.authorId,
      description: observation.description,
      status: observation.status,
      createdAt: observation.createdAt
    });
  } catch (error) {
    console.error('Erreur restauration observation:', error);
    return res.status(500).json({ error: 'Erreur lors de la restauration de l\'observation' });
  }
};

/**
 * Récupère l'historique d'un utilisateur (ADMIN uniquement)
 * GET /api/admin/users/:id/history
 */
export const getAdminUserHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const history = await getUserHistory(id);

    return res.status(200).json({
      userId: id,
      totalActions: history.length,
      history
    });
  } catch (error) {
    console.error('Erreur récupération historique utilisateur:', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération de l\'historique' });
  }
};

/**
 * Récupère l'historique d'une espèce (EXPERT ou ADMIN)
 * GET /api/expert/species/:id/history
 */
export const getExpertSpeciesHistory = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que l'espèce existe
    const species = await Species.findById(id);
    if (!species) {
      return res.status(404).json({ error: 'Espèce non trouvée' });
    }

    const history = await getSpeciesHistory(id);

    return res.status(200).json({
      speciesId: id,
      speciesName: species.name,
      totalActions: history.length,
      history
    });
  } catch (error) {
    console.error('Erreur récupération historique espèce:', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération de l\'historique' });
  }
};

/**
 * Supprime logiquement une espèce (ADMIN uniquement)
 * DELETE /api/admin/species/:id
 */
export const softDeleteSpecies = async (req, res) => {
  try {
    const { id } = req.params;

    const species = await Species.findById(id);

    if (!species) {
      return res.status(404).json({ error: 'Espèce non trouvée' });
    }

    if (species.deletedAt) {
      return res.status(400).json({ 
        error: 'Cette espèce a déjà été supprimée' 
      });
    }

    // Marquer comme supprimée
    species.deletedAt = new Date();
    species.deletedBy = req.user.id;
    await species.save();

    // Enregistrer dans l'historique
    await recordHistory(
      HistoryAction.DELETED,
      req.user.id,
      req.user.role,
      'species',
      species._id.toString(),
      {
        name: species.name,
        authorId: species.authorId
      }
    );

    return res.status(200).json({
      message: 'Espèce supprimée avec succès',
      id: species._id,
      deletedAt: species.deletedAt,
      deletedBy: species.deletedBy
    });
  } catch (error) {
    console.error('Erreur suppression espèce:', error);
    return res.status(500).json({ error: 'Erreur lors de la suppression de l\'espèce' });
  }
};
