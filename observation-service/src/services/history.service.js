import { History, HistoryAction } from '../models/History.js';
import { Observation } from '../models/Observation.js';
import { Species } from '../models/Species.js';

/**
 * Enregistre une action dans l'historique
 */
export const recordHistory = async (action, performedBy, performedByRole, targetType, targetId, metadata = {}) => {
  try {
    const historyEntry = {
      action,
      performedBy,
      performedByRole,
      targetType,
      targetId,
      metadata
    };

    // Si c'est une observation, ajouter les infos supplémentaires
    if (targetType === 'observation') {
      const observation = await Observation.findById(targetId);
      if (observation) {
        historyEntry.observationAuthorId = observation.authorId;
        historyEntry.observationSpeciesId = observation.speciesId;
      }
    }

    // Si c'est une espèce, ajouter le nom
    if (targetType === 'species') {
      const species = await Species.findById(targetId);
      if (species) {
        historyEntry.speciesName = species.name;
      }
    }

    const history = new History(historyEntry);
    await history.save();
    return history;
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement dans l\'historique:', error);
    throw error;
  }
};

/**
 * Récupère l'historique d'un utilisateur
 */
export const getUserHistory = async (userId) => {
  try {
    const history = await History.find({
      observationAuthorId: userId
    }).sort({ createdAt: -1 });

    return history.map(h => ({
      id: h._id,
      action: h.action,
      performedBy: h.performedBy,
      performedByRole: h.performedByRole,
      targetType: h.targetType,
      targetId: h.targetId,
      observationSpeciesId: h.observationSpeciesId,
      metadata: h.metadata,
      createdAt: h.createdAt
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique utilisateur:', error);
    throw error;
  }
};

/**
 * Récupère l'historique d'une espèce
 */
export const getSpeciesHistory = async (speciesId) => {
  try {
    const history = await History.find({
      $or: [
        { targetId: speciesId, targetType: 'species' },
        { observationSpeciesId: speciesId }
      ]
    }).sort({ createdAt: -1 });

    return history.map(h => ({
      id: h._id,
      action: h.action,
      performedBy: h.performedBy,
      performedByRole: h.performedByRole,
      targetType: h.targetType,
      targetId: h.targetId,
      observationAuthorId: h.observationAuthorId,
      metadata: h.metadata,
      createdAt: h.createdAt
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique de l\'espèce:', error);
    throw error;
  }
};
