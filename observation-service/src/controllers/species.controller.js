import { Species } from '../models/Species.js';
import { Observation } from '../models/Observation.js';

/**
 * Crée une nouvelle espèce
 * POST /api/species
 */
export const createSpecies = async (req, res) => {
  try {
    const { name } = req.body;
    
    // Vérifier que l'utilisateur est authentifié
    if (!req.user || !req.user.id) {
      console.error('[CREATE SPECIES] User not authenticated or ID missing');
      return res.status(401).json({ 
        error: 'Authentification requise',
        details: 'req.user ou req.user.id est undefined'
      });
    }

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Le nom de l\'espèce est obligatoire' });
    }

    // Vérifier l'unicité du nom
    const existingSpecies = await Species.findOne({ name: name.trim() });
    if (existingSpecies) {
      return res.status(409).json({ 
        error: 'Une espèce avec ce nom existe déjà' 
      });
    }

    const species = new Species({
      name: name.trim(),
      authorId: req.user.id,
      rarityScore: 1.0
    });

    await species.save();

    return res.status(201).json({
      id: species._id,
      name: species.name,
      authorId: species.authorId,
      rarityScore: species.rarityScore,
      createdAt: species.createdAt
    });
  } catch (error) {
    console.error('Erreur création espèce:', error);
    return res.status(500).json({ error: 'Erreur lors de la création de l\'espèce' });
  }
};

/**
 * Récupère une espèce par son ID
 * GET /api/species/:id
 */
export const getSpeciesById = async (req, res) => {
  try {
    const { id } = req.params;

    const species = await Species.findById(id);

    if (!species) {
      return res.status(404).json({ error: 'Espèce non trouvée' });
    }

    return res.status(200).json({
      id: species._id,
      name: species.name,
      authorId: species.authorId,
      rarityScore: species.rarityScore,
      createdAt: species.createdAt
    });
  } catch (error) {
    console.error('Erreur récupération espèce:', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération de l\'espèce' });
  }
};

/**
 * Récupère toutes les espèces
 * GET /api/species?sortByRarity=true
 */
export const getAllSpecies = async (req, res) => {
  try {
    const { sortByRarity } = req.query;

    let query = Species.find();

    if (sortByRarity === 'true') {
      query = query.sort({ rarityScore: -1 });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    const species = await query.exec();

    return res.status(200).json(
      species.map(sp => ({
        id: sp._id,
        name: sp.name,
        authorId: sp.authorId,
        rarityScore: sp.rarityScore,
        createdAt: sp.createdAt
      }))
    );
  } catch (error) {
    console.error('Erreur récupération espèces:', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération des espèces' });
  }
};
