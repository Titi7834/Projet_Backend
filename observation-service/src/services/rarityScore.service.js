import { Species } from '../models/Species.js';
import { Observation, ObservationStatus } from '../models/Observation.js';

/**
 * Calcule le rarityScore d'une espèce
 * Formule: rarityScore = 1 + (nombre d'observations validées / 5)
 */
export const calculateRarityScore = (validatedCount) => {
  return 1 + (validatedCount / 5);
};

/**
 * Met à jour le rarityScore d'une espèce après une validation/rejet
 */
export const updateRarityScore = async (speciesId) => {
  const validatedCount = await Observation.countDocuments({
    speciesId,
    status: ObservationStatus.VALIDATED
  });

  const newRarityScore = calculateRarityScore(validatedCount);

  await Species.findByIdAndUpdate(speciesId, {
    rarityScore: newRarityScore
  });

  return newRarityScore;
};

/**
 * Recalcule tous les rarityScores (utile pour la maintenance)
 */
export const recalculateAllRarityScores = async () => {
  const species = await Species.find();
  
  const updatePromises = species.map(async (sp) => {
    const validatedCount = await Observation.countDocuments({
      speciesId: sp._id.toString(),
      status: ObservationStatus.VALIDATED
    });
    
    const newRarityScore = calculateRarityScore(validatedCount);
    
    await Species.findByIdAndUpdate(sp._id, {
      rarityScore: newRarityScore
    });
    
    return {
      speciesId: sp._id,
      name: sp.name,
      validatedCount,
      newRarityScore
    };
  });

  return await Promise.all(updatePromises);
};

/**
 * Obtient des statistiques sur les rarityScores
 */
export const getSpeciesRarityStats = async () => {
  const species = await Species.find().sort({ rarityScore: -1 });
  
  const stats = {
    total: species.length,
    highest: species[0] ? {
      name: species[0].name,
      rarityScore: species[0].rarityScore
    } : null,
    lowest: species[species.length - 1] ? {
      name: species[species.length - 1].name,
      rarityScore: species[species.length - 1].rarityScore
    } : null,
    average: species.length > 0 
      ? species.reduce((sum, sp) => sum + sp.rarityScore, 0) / species.length 
      : 0
  };

  return stats;
};
