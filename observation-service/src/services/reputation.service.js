/**
 * Service de gestion de la réputation (Niveau Intermédiaire)
 * Pour le niveau intermédiaire, nous loggons les actions
 * Pour le niveau avancé, ces fonctions pourront être connectées à user-service via HTTP
 */

/**
 * Traite une observation validée : +3 points pour l'auteur, +1 pour l'EXPERT validateur
 */
export const handleObservationValidated = async (authorId, validatorId, validatorRole) => {
  console.log(`[REPUTATION] Observation validée:`);
  console.log(`  - Auteur ${authorId}: +3 points de réputation`);
  
  if (validatorRole === 'EXPERT') {
    console.log(`  - Expert ${validatorId}: +1 point de réputation`);
  }

  // TODO: Au niveau avancé, envoyer des requêtes HTTP vers user-service
  // await userServiceClient.updateReputation(authorId, 3);
  // if (validatorRole === 'EXPERT') {
  //   await userServiceClient.updateReputation(validatorId, 1);
  // }
};

/**
 * Traite une observation rejetée : -1 point pour l'auteur
 */
export const handleObservationRejected = async (authorId) => {
  console.log(`[REPUTATION] Observation rejetée:`);
  console.log(`  - Auteur ${authorId}: -1 point de réputation`);

  // TODO: Au niveau avancé, envoyer une requête HTTP vers user-service
  // await userServiceClient.updateReputation(authorId, -1);
};

/**
 * Vérifie si un utilisateur devrait être promu EXPERT (>= 10 points)
 */
export const shouldPromoteToExpert = async (userId, currentReputation) => {
  if (currentReputation >= 10) {
    console.log(`[REPUTATION] L'utilisateur ${userId} devrait être promu EXPERT (réputation: ${currentReputation})`);
    return true;
  }
  return false;
};

/**
 * Log pour la promotion manuelle
 */
export const logPromotionCandidate = async (userId, reputation) => {
  console.log(`[REPUTATION] Candidat à la promotion EXPERT:`);
  console.log(`  - UserId: ${userId}`);
  console.log(`  - Réputation: ${reputation}`);
  console.log(`  - Action requise: Promouvoir manuellement via user-service`);
};
