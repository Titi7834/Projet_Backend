import { Observation, ObservationStatus } from '../models/Observation.js';
import { Species } from '../models/Species.js';
import { updateRarityScore } from '../services/rarityScore.service.js';
import { 
  handleObservationValidated, 
  handleObservationRejected 
} from '../services/reputation.service.js';
import { recordHistory } from '../services/history.service.js';
import { HistoryAction } from '../models/History.js';

/**
 * Crée une nouvelle observation
 * POST /api/observations
 * Règle: Un utilisateur ne peut créer qu'une seule observation par espèce toutes les 5 minutes
 */
export const createObservation = async (req, res) => {
  try {
    const { speciesId, description, dangerLevel } = req.body;

    // Vérifications de base
    if (!speciesId || !description || dangerLevel === undefined) {
      return res.status(400).json({ 
        error: 'Les champs speciesId, description et dangerLevel sont obligatoires' 
      });
    }

    // Vérifier que l'espèce existe
    const species = await Species.findById(speciesId);
    if (!species) {
      return res.status(404).json({ error: 'Espèce non trouvée' });
    }

    // Vérifier la règle des 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentObservation = await Observation.findOne({
      authorId: req.user.id,
      speciesId,
      createdAt: { $gte: fiveMinutesAgo }
    });

    if (recentObservation) {
      const waitTime = Math.ceil((recentObservation.createdAt.getTime() + 5 * 60 * 1000 - Date.now()) / 1000);
      return res.status(429).json({ 
        error: `Vous devez attendre ${waitTime} secondes avant de créer une nouvelle observation pour cette espèce` 
      });
    }

    // Créer l'observation
    const observation = new Observation({
      speciesId,
      authorId: req.user.id,
      description: description.trim(),
      dangerLevel,
      status: ObservationStatus.PENDING
    });

    await observation.save();

    return res.status(201).json({
      id: observation._id,
      speciesId: observation.speciesId,
      authorId: observation.authorId,
      description: observation.description,
      dangerLevel: observation.dangerLevel,
      status: observation.status,
      createdAt: observation.createdAt
    });
  } catch (error) {
    console.error('Erreur création observation:', error);
    return res.status(500).json({ error: 'Erreur lors de la création de l\'observation' });
  }
};

/**
 * Récupère toutes les observations d'une espèce
 * GET /api/species/:id/observations
 */
export const getObservationsBySpecies = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que l'espèce existe
    const species = await Species.findById(id);
    if (!species) {
      return res.status(404).json({ error: 'Espèce non trouvée' });
    }

    const observations = await Observation.find({ speciesId: id })
      .sort({ createdAt: -1 });

    return res.status(200).json(
      observations.map(obs => ({
        id: obs._id,
        speciesId: obs.speciesId,
        authorId: obs.authorId,
        description: obs.description,
        dangerLevel: obs.dangerLevel,
        status: obs.status,
        validatedBy: obs.validatedBy,
        validatedAt: obs.validatedAt,
        createdAt: obs.createdAt
      }))
    );
  } catch (error) {
    console.error('Erreur récupération observations:', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération des observations' });
  }
};

/**
 * Valide une observation (EXPERT ou ADMIN uniquement)
 * POST /api/observations/:id/validate
 * Règle: Un utilisateur ne peut pas valider sa propre observation
 */
export const validateObservation = async (req, res) => {
  try {
    const { id } = req.params;

    const observation = await Observation.findById(id);

    if (!observation) {
      return res.status(404).json({ error: 'Observation non trouvée' });
    }

    if (observation.status !== ObservationStatus.PENDING) {
      return res.status(400).json({ 
        error: `Cette observation a déjà été ${observation.status.toLowerCase()}` 
      });
    }

    // Règle: pas d'auto-validation
    if (observation.authorId === req.user.id) {
      return res.status(403).json({ 
        error: 'Vous ne pouvez pas valider votre propre observation' 
      });
    }

    // Mettre à jour l'observation
    observation.status = ObservationStatus.VALIDATED;
    observation.validatedBy = req.user.id;
    observation.validatedAt = new Date();
    await observation.save();

    // Mettre à jour le rarityScore de l'espèce
    const newRarityScore = await updateRarityScore(observation.speciesId);

    // Gérer la réputation
    await handleObservationValidated(
      observation.authorId,
      req.user.id,
      req.user.role
    );

    // Enregistrer dans l'historique
    await recordHistory(
      HistoryAction.VALIDATED,
      req.user.id,
      req.user.role,
      'observation',
      observation._id.toString(),
      {
        authorId: observation.authorId,
        speciesId: observation.speciesId,
        description: observation.description
      }
    );

    return res.status(200).json({
      id: observation._id,
      speciesId: observation.speciesId,
      authorId: observation.authorId,
      description: observation.description,
      dangerLevel: observation.dangerLevel,
      status: observation.status,
      validatedBy: observation.validatedBy,
      validatedAt: observation.validatedAt,
      createdAt: observation.createdAt,
      newRarityScore
    });
  } catch (error) {
    console.error('Erreur validation observation:', error);
    return res.status(500).json({ error: 'Erreur lors de la validation de l\'observation' });
  }
};

/**
 * Rejette une observation (EXPERT ou ADMIN uniquement)
 * POST /api/observations/:id/reject
 */
export const rejectObservation = async (req, res) => {
  try {
    const { id } = req.params;

    const observation = await Observation.findById(id);

    if (!observation) {
      return res.status(404).json({ error: 'Observation non trouvée' });
    }

    if (observation.status !== ObservationStatus.PENDING) {
      return res.status(400).json({ 
        error: `Cette observation a déjà été ${observation.status.toLowerCase()}` 
      });
    }

    // Mettre à jour l'observation
    observation.status = ObservationStatus.REJECTED;
    observation.validatedBy = req.user.id;
    observation.validatedAt = new Date();
    await observation.save();

    // Gérer la réputation
    await handleObservationRejected(observation.authorId);

    // Enregistrer dans l'historique
    await recordHistory(
      HistoryAction.REJECTED,
      req.user.id,
      req.user.role,
      'observation',
      observation._id.toString(),
      {
        authorId: observation.authorId,
        speciesId: observation.speciesId,
        description: observation.description
      }
    );

    return res.status(200).json({
      id: observation._id,
      speciesId: observation.speciesId,
      authorId: observation.authorId,
      description: observation.description,
      dangerLevel: observation.dangerLevel,
      status: observation.status,
      validatedBy: observation.validatedBy,
      validatedAt: observation.validatedAt,
      createdAt: observation.createdAt
    });
  } catch (error) {
    console.error('Erreur rejet observation:', error);
    return res.status(500).json({ error: 'Erreur lors du rejet de l\'observation' });
  }
};
