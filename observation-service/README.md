# 🌊 DeepSea Archives - Observation Service

Microservice de gestion des espèces abyssales et de leurs observations pour le projet DeepSea Archives.

## 📋 Description

Ce microservice permet de :
- Créer et gérer des espèces abyssales imaginaires
- Soumettre des observations sur ces espèces
- Valider ou rejeter les observations (EXPERT/ADMIN uniquement)
- Calculer automatiquement l'indice de rareté des espèces
- Gérer un système de réputation pour les utilisateurs

## 🎯 Niveau : Intermédiaire (13/20)

### Fonctionnalités implémentées

#### ✅ Gestion des espèces
- Création d'espèces avec nom unique
- Consultation des espèces par ID ou liste complète
- Tri des espèces par rareté (ascendant/descendant)
- Calcul automatique du `rarityScore = 1 + (observations validées / 5)`

#### ✅ Gestion des observations
- Création d'observations avec description et niveau de danger (1-5)
- Cooldown de 5 minutes entre deux observations d'une même espèce par un utilisateur
- Consultation des observations par espèce
- Validation et rejet des observations (EXPERT/ADMIN uniquement)
- Impossible de valider/rejeter sa propre observation

#### ✅ Système de réputation
- **Observation validée** : +3 points
- **Validation par un EXPERT** : +1 point bonus
- **Observation rejetée** : -1 point
- **Promotion automatique** : Un utilisateur avec 10+ points devient EXPERT

#### ✅ Sécurité
- Authentification JWT obligatoire sur toutes les routes
- Vérification des rôles (USER, EXPERT, ADMIN)
- Middleware d'authentification centralisé

## 🛠️ Stack Technique

- **Runtime** : Node.js avec TypeScript
- **Framework** : Express.js
- **Base de données** : MongoDB avec Mongoose
- **Authentification** : JWT (partagé avec auth-service)
- **Validation** : Mongoose schemas avec validateurs

## 📦 Installation

### Prérequis

- Node.js (v18+)
- MongoDB (v6+)
- npm ou yarn

### Étapes d'installation

1. **Cloner le projet**
```bash
git clone <repository-url>
cd observation-service
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**
```bash
cp .env.example .env
```

Éditez le fichier `.env` et configurez :
- `MONGODB_URI` : URL de connexion MongoDB
- `JWT_SECRET` : Clé secrète JWT (doit être identique à auth-service)
- `PORT` : Port du serveur (par défaut 3002)

4. **Démarrer MongoDB**
```bash
# Si MongoDB n'est pas installé globalement
mongod --dbpath ./data
```

5. **Lancer le serveur**
```bash
# Mode développement avec rechargement automatique
npm run dev

# Mode production
npm run build
npm start
```

Le serveur démarre sur `http://localhost:3002`

## 🔌 API Endpoints

### 🏠 Route principale
```
GET /
```
Affiche les informations du service et la liste des endpoints disponibles.

---

### 🐙 Gestion des espèces

#### Créer une espèce
```http
POST /species
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Calamar Géant des Abysses"
}
```

**Règles** :
- Nom unique (insensible à la casse)
- Authentification requise
- `rarityScore` initialisé à 1.0

#### Récupérer une espèce
```http
GET /species/:id
Authorization: Bearer <token>
```

#### Liste toutes les espèces
```http
GET /species?sortByRarity=desc
Authorization: Bearer <token>
```

**Query params** :
- `sortByRarity` : `asc` ou `desc` (optionnel)

#### Récupérer les observations d'une espèce
```http
GET /species/:id/observations?status=VALIDATED
Authorization: Bearer <token>
```

**Query params** :
- `status` : `PENDING`, `VALIDATED`, ou `REJECTED` (optionnel)

---

### 👁️ Gestion des observations

#### Créer une observation
```http
POST /observations
Authorization: Bearer <token>
Content-Type: application/json

{
  "speciesId": "65abc123...",
  "description": "Observation fascinante de tentacules bioluminescents mesurant plus de 10 mètres",
  "dangerLevel": 4
}
```

**Règles** :
- `description` : minimum 10 caractères
- `dangerLevel` : entre 1 et 5
- Cooldown de 5 minutes par espèce et par utilisateur
- Statut initial : `PENDING`

#### Valider une observation
```http
POST /observations/:id/validate
Authorization: Bearer <token>
```

**Permissions** : EXPERT ou ADMIN uniquement

**Règles** :
- Impossible de valider sa propre observation
- L'observation doit être `PENDING`
- Met à jour le `rarityScore` de l'espèce
- Attribution de réputation : +3 (+4 si validé par EXPERT)

#### Rejeter une observation
```http
POST /observations/:id/reject
Authorization: Bearer <token>
```

**Permissions** : EXPERT ou ADMIN uniquement

**Règles** :
- Impossible de rejeter sa propre observation
- L'observation doit être `PENDING`
- Pénalité de réputation : -1

---

## 🧪 Exemples de requêtes avec Postman

### 1. Obtenir un token JWT
D'abord, authentifiez-vous via **auth-service** :
```http
POST http://localhost:3001/auth/login
Content-Type: application/json

{
  "email": "expert@deepsea.com",
  "password": "password123"
}
```

Copiez le `token` de la réponse.

### 2. Créer une espèce
```http
POST http://localhost:3002/species
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Poisson-Dragon Abyssal"
}
```

### 3. Soumettre une observation
```http
POST http://localhost:3002/observations
Authorization: Bearer <token>
Content-Type: application/json

{
  "speciesId": "65abc123def456...",
  "description": "Créature aperçue à 3000m de profondeur avec des écailles phosphorescentes",
  "dangerLevel": 3
}
```

### 4. Lister les espèces par rareté
```http
GET http://localhost:3002/species?sortByRarity=desc
Authorization: Bearer <token>
```

### 5. Valider une observation (EXPERT)
```http
POST http://localhost:3002/observations/65def789ghi012.../validate
Authorization: Bearer <expert_token>
```

---

## 📊 Modèles de données

### Species (Espèce)
```typescript
{
  _id: ObjectId,
  name: string,              // Unique
  authorId: string,          // ID de l'utilisateur créateur
  rarityScore: number,       // Calculé : 1 + (validatedCount / 5)
  createdAt: Date
}
```

### Observation
```typescript
{
  _id: ObjectId,
  speciesId: string,         // Référence à Species
  authorId: string,          // ID de l'observateur
  description: string,       // Minimum 10 caractères
  dangerLevel: number,       // Entre 1 et 5
  status: enum,              // PENDING | VALIDATED | REJECTED
  validatedBy: string?,      // ID du validateur (null si PENDING)
  validatedAt: Date?,        // Date de validation (null si PENDING)
  createdAt: Date
}
```

---

## 🔐 Authentification

Le service utilise JWT pour l'authentification. Le token doit être fourni dans le header :

```
Authorization: Bearer <token>
```

Le token JWT doit contenir :
```typescript
{
  userId: string,
  email: string,
  role: 'USER' | 'EXPERT' | 'ADMIN',
  reputation: number
}
```

---

## 🎮 Système de réputation

### Attribution des points

| Action | Points | Conditions |
|--------|--------|-----------|
| Observation validée | +3 | Base |
| Validation par EXPERT | +1 | Bonus supplémentaire |
| Observation rejetée | -1 | Pénalité |

### Promotion EXPERT

Un utilisateur avec **10 points de réputation ou plus** devient automatiquement **EXPERT**.

> ⚠️ **Note** : Pour le niveau intermédiaire, la mise à jour de réputation est loggée. Dans un système complet, observation-service devrait appeler auth-service pour mettre à jour la réputation et le rôle.

---

## 📁 Structure du projet

```
observation-service/
├── src/
│   ├── config/
│   │   └── database.ts          # Configuration MongoDB
│   ├── controllers/
│   │   ├── observation.controller.ts
│   │   └── species.controller.ts
│   ├── middlewares/
│   │   └── auth.ts              # Middleware JWT
│   ├── models/
│   │   ├── Observation.ts       # Modèle Mongoose
│   │   └── Species.ts           # Modèle Mongoose
│   ├── routes/
│   │   ├── observation.routes.ts
│   │   └── species.routes.ts
│   ├── services/
│   │   ├── rarityScore.service.ts
│   │   └── reputation.service.ts
│   └── server.ts                # Point d'entrée
├── .env                         # Variables d'environnement
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🐛 Débogage

### Vérifier la connexion MongoDB
```bash
mongosh
use observation-service
db.species.find()
db.observations.find()
```

### Logs du serveur
Le serveur affiche des logs détaillés :
- ✅ Actions réussies
- ❌ Erreurs
- 📊 Mises à jour de réputation
- 🎉 Promotions potentielles

---

## 🚀 Prochaines étapes (Niveau Avancé)

- [ ] Intégration HTTP avec auth-service pour la réputation
- [ ] Soft delete des observations
- [ ] Historique des validations/rejets
- [ ] Statistiques par espèce
- [ ] Taxonomy-service pour la classification

---

## 👥 Auteurs

Projet réalisé dans le cadre du cours Backend - DeepSea Archives

---

## 📝 Licence

ISC
