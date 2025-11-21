# Taxonomy Service

## 📋 Description

Le `taxonomy-service` est un microservice dédié à l'analyse et à la classification des espèces dans DeepSea Archives. Il interroge le `observation-service` pour récupérer les données et génère des statistiques taxonomiques complètes.

## 🎯 Fonctionnalités

### 1. Statistiques Globales
- Nombre total d'espèces
- Nombre total d'observations validées
- Moyenne d'observations par espèce
- Distribution par niveau de rareté

### 2. Analyse des Occurrences
- Liste des espèces triées par nombre d'observations
- Score de rareté pour chaque espèce

### 3. Analyse des Mots-clés
- Extraction des mots-clés récurrents dans les descriptions
- Top 10 des termes les plus utilisés
- Filtrage des mots vides (stopwords)

### 4. Classification Taxonomique

#### Familles
Organisation automatique des espèces en 5 familles :
- **Famille des Abyssaux Communs** : Espèces avec beaucoup d'observations (>10)
- **Famille des Créatures Rares** : Espèces avec rarityScore >= 3.0
- **Famille des Prédateurs** : Espèces avec mots-clés "danger", "prédateur", etc.
- **Famille des Espèces Récentes** : Espèces avec peu d'observations (<=2)
- **Famille Non Classifiée** : Autres espèces

#### Sous-espèces
Génération automatique de variantes basées sur les observations :
- **Variante Agressive** : Niveau de danger moyen >= 4
- **Variante Passive** : Niveau de danger moyen <= 2

#### Branches Évolutives
Hypothèses d'évolution basées sur les familles :
- Ancêtre hypothétique
- Liste des descendants potentiels
- Description de la branche évolutive

## 🔧 Installation

```bash
cd taxonomy-service
npm install
```

## 🚀 Démarrage

### Développement
```bash
npm run dev
```

### Production
```bash
npm start
```

### Docker
```bash
docker-compose up taxonomy-service
```

## 📡 Endpoints

### GET /api/taxonomy/stats
Récupère les statistiques taxonomiques complètes.

**Headers requis:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Réponse:**
```json
{
  "summary": {
    "totalSpecies": 5,
    "totalValidatedObservations": 23,
    "averageObservationsPerSpecies": 4.6,
    "totalPendingObservations": 2,
    "totalRejectedObservations": 1
  },
  "speciesOccurrences": [...],
  "rarityDistribution": {
    "common": 2,
    "uncommon": 2,
    "rare": 1,
    "veryRare": 0
  },
  "globalKeywords": [...],
  "taxonomicClassification": {
    "families": [...],
    "subSpecies": [...],
    "evolutionaryBranches": [...]
  },
  "generatedAt": "2025-11-20T..."
}
```

### GET /health
Vérification de l'état du service.

## ⚙️ Variables d'Environnement

Créer un fichier `.env` à la racine du service :

```env
PORT=3003
JWT_SECRET=your-secret-key-change-this-in-production
OBSERVATION_SERVICE_URL=http://localhost:4002
```

## 🏗️ Architecture

```
taxonomy-service/
├── src/
│   ├── controllers/
│   │   └── taxonomy.controller.js
│   ├── middlewares/
│   │   └── auth.js
│   ├── routes/
│   │   └── taxonomy.routes.js
│   ├── services/
│   │   ├── observation.service.js    # Communication avec observation-service
│   │   └── taxonomy.service.js       # Logique d'analyse taxonomique
│   └── server.js
├── Dockerfile
├── package.json
└── .env.example
```

## 📊 Algorithmes de Classification

### Classification en Familles
```javascript
if (rarityScore >= 3.0) → Famille des Créatures Rares
else if (observationCount > 10) → Famille des Abyssaux Communs
else if (keywords contient ['danger', 'prédateur', ...]) → Famille des Prédateurs
else if (observationCount <= 2) → Famille des Espèces Récentes
else → Famille Non Classifiée
```

### Génération de Sous-espèces
```javascript
if (observationCount >= 5) {
  avgDanger = moyenne des niveaux de danger
  
  if (avgDanger >= 4) → Variante Agressive
  if (avgDanger <= 2) → Variante Passive
}
```

### Analyse des Mots-clés
1. Tokenisation des descriptions
2. Normalisation (lowercase)
3. Filtrage des stopwords
4. Comptage des occurrences
5. Tri et sélection du top 10

## 🔄 Communication Inter-services

Le taxonomy-service communique avec le observation-service via HTTP :

```javascript
// Récupérer toutes les espèces
GET http://observation-service:3002/api/species

// Récupérer les observations d'une espèce
GET http://observation-service:3002/api/species/{id}/observations
```

## 🐳 Docker

**Dockerfile:**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3003
CMD ["npm", "start"]
```

**Dans docker-compose.yaml:**
```yaml
taxonomy-service:
  build: ./taxonomy-service
  ports:
    - "4003:3003"
  environment:
    PORT: 3003
    JWT_SECRET: your-secret-key
    OBSERVATION_SERVICE_URL: http://observation-service:3002
  depends_on:
    - observation-service
```

## 🧪 Exemples de Tests

### Test avec curl
```bash
# Health check
curl http://localhost:4003/health

# Récupérer les stats (avec token)
curl -H "Authorization: Bearer <token>" \
     http://localhost:4003/api/taxonomy/stats
```

### Test avec Postman
1. Créer une requête GET vers `http://localhost:4003/api/taxonomy/stats`
2. Ajouter le header `Authorization: Bearer <token>`
3. Envoyer la requête

## 📈 Performance

Le service effectue des appels multiples au observation-service :
- 1 appel pour récupérer toutes les espèces
- N appels pour récupérer les observations de chaque espèce

**Optimisations possibles:**
- Cache des résultats
- Endpoint dédié dans observation-service pour récupérer toutes les données
- Pagination

## 🔒 Sécurité

- ✅ Authentification JWT obligatoire
- ✅ Vérification des tokens via middleware
- ✅ Pas d'accès direct à la base de données

## 🚀 Évolutions Futures

- [ ] Cache des statistiques (Redis)
- [ ] Endpoint pour les statistiques d'une espèce spécifique
- [ ] Filtres et options de tri
- [ ] Export des statistiques (CSV, JSON)
- [ ] Graphiques et visualisations
- [ ] Analyse temporelle de l'évolution des espèces
- [ ] Machine Learning pour classification avancée

## 📝 Notes Techniques

- Le service est **stateless** (pas de base de données)
- Les données sont recalculées à chaque requête
- L'analyse des mots-clés est basique (pas de NLP avancé)
- La classification est déterministe basée sur des règles

## 🐛 Débogage

```bash
# Voir les logs du service
docker-compose logs -f taxonomy-service

# Vérifier la connexion au observation-service
docker exec taxonomy-service curl http://observation-service:3002/health
```

---

**Version:** 1.0.0  
**Niveau:** 16/20 - Avancé
