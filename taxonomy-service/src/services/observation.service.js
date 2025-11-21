import fetch from 'node-fetch';

const OBSERVATION_SERVICE_URL = process.env.OBSERVATION_SERVICE_URL || 'http://localhost:4002';

/**
 * Récupère toutes les espèces depuis observation-service
 */
export const fetchAllSpecies = async (token) => {
  try {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // Ajouter le token JWT si fourni
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${OBSERVATION_SERVICE_URL}/api/species`, {
      headers
    });
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des espèces:', error);
    throw error;
  }
};

/**
 * Récupère toutes les observations pour une espèce
 */
export const fetchObservationsBySpecies = async (speciesId, token) => {
  try {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // Ajouter le token JWT si fourni
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${OBSERVATION_SERVICE_URL}/api/species/${speciesId}/observations`, {
      headers
    });
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Erreur lors de la récupération des observations pour l'espèce ${speciesId}:`, error);
    throw error;
  }
};

/**
 * Récupère une espèce par son ID
 */
export const fetchSpeciesById = async (speciesId, token) => {
  try {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // Ajouter le token JWT si fourni
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${OBSERVATION_SERVICE_URL}/api/species/${speciesId}`, {
      headers
    });
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'espèce ${speciesId}:`, error);
    throw error;
  }
};
