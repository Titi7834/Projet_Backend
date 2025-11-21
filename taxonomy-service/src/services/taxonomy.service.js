import { fetchAllSpecies, fetchObservationsBySpecies } from './observation.service.js';

/**
 * Analyse les mots-clés récurrents dans les descriptions
 */
const analyzeKeywords = (descriptions) => {
  // Mots vides à ignorer
  const stopWords = new Set([
    'le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'et', 'à', 'en', 'dans',
    'par', 'pour', 'sur', 'avec', 'sans', 'est', 'sont', 'a', 'ont', 'au', 'aux',
    'cette', 'ce', 'ces', 'son', 'sa', 'ses', 'que', 'qui', 'quoi', 'dont', 'où'
  ]);

  const wordCount = {};

  descriptions.forEach(desc => {
    const words = desc
      .toLowerCase()
      .replace(/[^\w\sàâäéèêëïîôùûüÿç]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word));

    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
  });

  // Trier par fréquence et retourner les top 10
  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));
};

/**
 * Classe les espèces en familles basées sur les caractéristiques communes
 */
const classifyIntoFamilies = (speciesData) => {
  const families = {
    'Famille des Abyssaux Communs': [],
    'Famille des Créatures Rares': [],
    'Famille des Prédateurs': [],
    'Famille des Espèces Récentes': [],
    'Famille Non Classifiée': []
  };

  speciesData.forEach(species => {
    // Classification basée sur rarityScore et observations
    if (species.rarityScore >= 3.0) {
      families['Famille des Créatures Rares'].push(species);
    } else if (species.observationCount > 10) {
      families['Famille des Abyssaux Communs'].push(species);
    } else if (species.keywords.some(kw => 
      ['danger', 'prédateur', 'attaque', 'agressif'].includes(kw.word)
    )) {
      families['Famille des Prédateurs'].push(species);
    } else if (species.observationCount <= 2) {
      families['Famille des Espèces Récentes'].push(species);
    } else {
      families['Famille Non Classifiée'].push(species);
    }
  });

  // Formater pour le retour
  return Object.entries(families)
    .filter(([_, members]) => members.length > 0)
    .map(([familyName, members]) => ({
      name: familyName,
      speciesCount: members.length,
      species: members.map(s => ({
        id: s.id,
        name: s.name,
        rarityScore: s.rarityScore,
        observationCount: s.observationCount
      }))
    }));
};

/**
 * Génère des sous-espèces fictives basées sur les observations
 */
const generateSubSpecies = (speciesData) => {
  const subSpecies = [];

  speciesData.forEach(species => {
    if (species.observationCount >= 5) {
      // Générer des sous-espèces basées sur les niveaux de danger
      const dangerLevels = species.observations
        .map(obs => obs.dangerLevel)
        .filter(d => d !== undefined);

      if (dangerLevels.length > 0) {
        const avgDanger = dangerLevels.reduce((a, b) => a + b, 0) / dangerLevels.length;
        
        if (avgDanger >= 4) {
          subSpecies.push({
            parentSpeciesId: species.id,
            parentSpeciesName: species.name,
            subSpeciesName: `${species.name} - Variante Agressive`,
            characteristics: 'Niveau de danger élevé, comportement agressif',
            basedOnObservations: dangerLevels.filter(d => d >= 4).length
          });
        }
        
        if (avgDanger <= 2) {
          subSpecies.push({
            parentSpeciesId: species.id,
            parentSpeciesName: species.name,
            subSpeciesName: `${species.name} - Variante Passive`,
            characteristics: 'Niveau de danger faible, comportement passif',
            basedOnObservations: dangerLevels.filter(d => d <= 2).length
          });
        }
      }
    }
  });

  return subSpecies;
};

/**
 * Génère des branches évolutives hypothétiques
 */
const generateEvolutionaryBranches = (families) => {
  const branches = [];

  // Créer des branches basées sur les familles
  families.forEach((family, index) => {
    if (family.speciesCount >= 2) {
      branches.push({
        branchId: index + 1,
        name: `Branche ${family.name}`,
        description: `Évolution hypothétique des espèces de la ${family.name}`,
        speciesCount: family.speciesCount,
        ancestorHypothesis: family.species[0]?.name || 'Ancêtre inconnu',
        descendants: family.species.slice(1, 4).map(s => s.name)
      });
    }
  });

  return branches;
};

/**
 * Génère les statistiques taxonomiques complètes
 */
export const generateTaxonomyStats = async (token) => {
  try {
    // 1. Récupérer toutes les espèces (avec le token JWT)
    const allSpecies = await fetchAllSpecies(token);

    if (!allSpecies || allSpecies.length === 0) {
      return {
        totalSpecies: 0,
        totalObservations: 0,
        message: 'Aucune espèce trouvée'
      };
    }

    // 2. Pour chaque espèce, récupérer ses observations (avec le token JWT)
    const speciesData = await Promise.all(
      allSpecies.map(async (species) => {
        try {
          const observations = await fetchObservationsBySpecies(species.id, token);
          const validatedObservations = observations.filter(obs => 
            obs.status === 'VALIDATED' && !obs.deletedAt
          );

          // Analyser les mots-clés des descriptions
          const descriptions = validatedObservations.map(obs => obs.description);
          const keywords = analyzeKeywords(descriptions);

          return {
            id: species.id,
            name: species.name,
            rarityScore: species.rarityScore,
            observationCount: validatedObservations.length,
            totalObservations: observations.length,
            pendingObservations: observations.filter(o => o.status === 'PENDING').length,
            rejectedObservations: observations.filter(o => o.status === 'REJECTED').length,
            observations: validatedObservations,
            keywords,
            authorId: species.authorId,
            createdAt: species.createdAt
          };
        } catch (error) {
          console.error(`Erreur pour l'espèce ${species.id}:`, error);
          return {
            id: species.id,
            name: species.name,
            rarityScore: species.rarityScore,
            observationCount: 0,
            totalObservations: 0,
            keywords: [],
            observations: []
          };
        }
      })
    );

    // 3. Calculer les statistiques globales
    const totalObservations = speciesData.reduce((sum, s) => sum + s.observationCount, 0);
    const avgObservationsPerSpecies = totalObservations / speciesData.length;

    // 4. Trier par nombre d'observations
    const sortedByOccurrences = [...speciesData]
      .sort((a, b) => b.observationCount - a.observationCount)
      .map(s => ({
        name: s.name,
        id: s.id,
        occurrences: s.observationCount,
        rarityScore: s.rarityScore
      }));

    // 5. Analyser les mots-clés globaux
    const allDescriptions = speciesData
      .flatMap(s => s.observations.map(obs => obs.description));
    const globalKeywords = analyzeKeywords(allDescriptions);

    // 6. Classifier en familles
    const families = classifyIntoFamilies(speciesData);

    // 7. Générer des sous-espèces
    const subSpecies = generateSubSpecies(speciesData);

    // 8. Générer des branches évolutives
    const evolutionaryBranches = generateEvolutionaryBranches(families);

    // 9. Statistiques par rareté
    const rarityDistribution = {
      common: speciesData.filter(s => s.rarityScore < 2.0).length,
      uncommon: speciesData.filter(s => s.rarityScore >= 2.0 && s.rarityScore < 3.0).length,
      rare: speciesData.filter(s => s.rarityScore >= 3.0 && s.rarityScore < 4.0).length,
      veryRare: speciesData.filter(s => s.rarityScore >= 4.0).length
    };

    return {
      summary: {
        totalSpecies: allSpecies.length,
        totalValidatedObservations: totalObservations,
        averageObservationsPerSpecies: parseFloat(avgObservationsPerSpecies.toFixed(2)),
        totalPendingObservations: speciesData.reduce((sum, s) => sum + (s.pendingObservations || 0), 0),
        totalRejectedObservations: speciesData.reduce((sum, s) => sum + (s.rejectedObservations || 0), 0)
      },
      speciesOccurrences: sortedByOccurrences,
      rarityDistribution,
      globalKeywords,
      taxonomicClassification: {
        families,
        subSpecies,
        evolutionaryBranches
      },
      generatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Erreur lors de la génération des statistiques:', error);
    throw error;
  }
};
