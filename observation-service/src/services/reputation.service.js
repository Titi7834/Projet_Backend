import fetch from 'node-fetch';

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3000';

/**
 * Service de gestion de la réputation
 * Communique avec auth-service pour mettre à jour la réputation des utilisateurs
 */

/**
 * Met à jour la réputation d'un utilisateur via l'auth-service
 */
const updateUserReputation = async (userId, points) => {
  try {
    const response = await fetch(`${AUTH_SERVICE_URL}/api/users/${userId}/reputation`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ points })
    });

    if (!response.ok) {
      console.error(`Erreur mise à jour réputation userId ${userId}: ${response.statusText}`);
      return false;
    }

    const data = await response.json();
    console.log(`[REPUTATION] Utilisateur ${userId}: ${points > 0 ? '+' : ''}${points} points (nouvelle réputation: ${data.reputation})`);
    
    // Vérifier si l'utilisateur doit être promu EXPERT
    if (data.reputation >= 10 && data.role === 'USER') {
      await promoteToExpert(userId);
    }

    return true;
  } catch (error) {
    console.error(`Erreur communication auth-service pour userId ${userId}:`, error.message);
    return false;
  }
};

/**
 * Promouvoir un utilisateur au rôle EXPERT
 */
const promoteToExpert = async (userId) => {
  try {
    const response = await fetch(`${AUTH_SERVICE_URL}/api/users/${userId}/role`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ role: 'EXPERT' })
    });

    if (!response.ok) {
      console.error(`Erreur promotion EXPERT userId ${userId}: ${response.statusText}`);
      return false;
    }

    console.log(`[REPUTATION] 🎉 Utilisateur ${userId} promu EXPERT !`);
    return true;
  } catch (error) {
    console.error(`Erreur promotion userId ${userId}:`, error.message);
    return false;
  }
};

/**
 * Traite une observation validée : +3 points pour l'auteur, +1 pour l'EXPERT validateur
 */
export const handleObservationValidated = async (authorId, validatorId, validatorRole) => {
  console.log(`[REPUTATION] Observation validée`);
  
  // +3 pour l'auteur
  await updateUserReputation(authorId, 3);
  
  // +1 pour le validateur si c'est un EXPERT
  if (validatorRole === 'EXPERT') {
    await updateUserReputation(validatorId, 1);
  }
};

/**
 * Traite une observation rejetée : -1 point pour l'auteur
 */
export const handleObservationRejected = async (authorId) => {
  console.log(`[REPUTATION] Observation rejetée`);
  await updateUserReputation(authorId, -1);
};
