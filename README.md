# 📚 Documentation Projet Backend - Système d'Observation de la Faune

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Documentation API](#documentation-api)
4. [Schéma de Base de Données](#schéma-de-base-de-données)
5. [Installation et Démarrage](#installation-et-démarrage)
6. [Tests](#tests)
7. [Déploiement](#déploiement)

---

## 🎯 Vue d'ensemble

Projet backend d'un système de gestion et d'observation de la faune basé sur une **architecture microservices**. Le système permet aux utilisateurs de créer des observations d'espèces animales, de les valider, et de consulter des statistiques taxonomiques.

### Fonctionnalités principales

- ✅ **Authentification et autorisation** (JWT)
- ✅ **Gestion des utilisateurs** avec système de réputation
- ✅ **Création et gestion des espèces**
- ✅ **Observations d'espèces** avec validation par experts
- ✅ **Système de modération** (soft delete)
- ✅ **Statistiques taxonomiques**
- ✅ **Historique des actions** (audit trail)

### Technologies

- **Runtime**: Node.js
- **Framework**: Express.js
- **Base de données**: MongoDB
- **Authentification**: JWT (JSON Web Tokens)
- **Containerisation**: Docker & Docker Compose
- **Documentation API**: Swagger/OpenAPI 3.0

---

## 🏗️ Architecture

Le projet suit une **architecture microservices** avec 3 services principaux :

### Services

| Service | Port | Responsabilité |
|---------|------|----------------|
| **auth-service** | 4000 | Authentification, gestion des utilisateurs |
| **observation-service** | 4002 | Gestion des espèces, observations, modération |
| **taxonomy-service** | 4003 | Statistiques et analyses taxonomiques |
| **MongoDB** | 27017 | Base de données centralisée |

### Diagramme d'Architecture

Pour visualiser l'architecture complète du système, consultez :
👉 **[Documentation Architecture](./docs/ARCHITECTURE.md)**

**Contenu :**
- Diagramme global de l'architecture microservices
- Flux d'authentification
- Flux de validation d'observation
- Architecture des collections MongoDB
- Communication inter-services
- Déploiement Docker Compose
- Niveaux d'accès et permissions

---

## 📖 Documentation API

Chaque microservice possède sa propre documentation Swagger/OpenAPI.

### Auth Service API

📄 **[swagger.yaml](./auth-service/swagger.yaml)**

**Endpoints principaux :**
- `POST /auth/register` - Créer un compte
- `POST /auth/login` - Se connecter
- `GET /auth/me` - Profil utilisateur
- `GET /api/admin/users` - Liste des utilisateurs (ADMIN)
- `PATCH /api/users/:id/role` - Modifier le rôle (ADMIN)
- `PATCH /api/users/:id/reputation` - Modifier la réputation

**Visualiser la documentation :**
```bash
# Copier le contenu de swagger.yaml dans https://editor.swagger.io/
```

### Observation Service API

📄 **[swagger.yaml](./observation-service/swagger.yaml)**

**Endpoints principaux :**
- `GET /api/species` - Liste des espèces
- `POST /api/species` - Créer une espèce
- `GET /api/species/:id/observations` - Observations d'une espèce
- `POST /api/observations` - Créer une observation
- `POST /api/observations/:id/validate` - Valider (EXPERT/ADMIN)
- `POST /api/observations/:id/reject` - Rejeter (EXPERT/ADMIN)
- `DELETE /api/admin/observations/:id` - Supprimer (ADMIN)
- `GET /api/admin/users/:id/history` - Historique utilisateur (ADMIN)
- `GET /api/expert/species/:id/history` - Historique espèce (EXPERT/ADMIN)

### Taxonomy Service API

📄 **[swagger.yaml](./taxonomy-service/swagger.yaml)**

**Endpoints principaux :**
- `GET /api/taxonomy/stats` - Statistiques taxonomiques

---

### Collections

| Collection | Service | Description |
|------------|---------|-------------|
| **users** | Auth | Utilisateurs avec rôles et réputation |
| **species** | Observation | Espèces animales |
| **observations** | Observation | Observations d'espèces |
| **histories** | Observation | Audit trail des actions |

---


```bash
# Cloner le projet
git clone <repository-url>
cd Projet_Backend

# Démarrer tous les services
docker-compose up -d

# Vérifier les logs
docker-compose logs -f

# Arrêter les services
docker-compose down
```

**Services disponibles :**
- Auth Service: http://localhost:4000
- Observation Service: http://localhost:4002
- Taxonomy Service: http://localhost:4003
- MongoDB: mongodb://admin:adminpassword@localhost:27017

### Démarrage en développement local

#### Auth Service
```bash
cd auth-service
npm install
npm run dev
```

#### Observation Service
```bash
cd observation-service
npm install
npm run dev
```

#### Taxonomy Service
```bash
cd taxonomy-service
npm install
npm run dev
```

### Variables d'environnement

Chaque service possède un fichier `.env` :

**auth-service/.env**
```env
PORT=3000
MONGODB_URI=mongodb://admin:adminpassword@localhost:27017/projet_backend?authSource=admin
JWT_SECRET=your-secret-key-change-this-in-production
OBSERVATION_SERVICE_URL=http://localhost:3002
```

**observation-service/.env**
```env
PORT=3002
MONGODB_URI=mongodb://admin:adminpassword@localhost:27017/projet_backend?authSource=admin
JWT_SECRET=your-secret-key-change-this-in-production
AUTH_SERVICE_URL=http://localhost:3000
```

**taxonomy-service/.env**
```env
PORT=3003
OBSERVATION_SERVICE_URL=http://observation-service:3002
JWT_SECRET=your-secret-key-change-this-in-production
```

---

## 🧪 Tests

### Collection Postman

Un fichier de collection Postman complet est disponible :
📄 **[Postman_Collection_Complete_Niveau_16.json](./Postman_Collection_Complete_Niveau_16.json)**

**Import dans Postman :**
1. Ouvrir Postman
2. File → Import
3. Sélectionner le fichier JSON
4. Configurer les variables d'environnement si nécessaire

---

## 📦 Déploiement

### Docker Compose (Production)

```bash
# Build et démarrage
docker-compose up -d --build

# Vérifier le statut
docker-compose ps

# Logs
docker-compose logs -f [service-name]

# Arrêt
docker-compose down

# Arrêt avec suppression des volumes
docker-compose down -v
```

### Variables d'environnement en production

⚠️ **Important** : Modifier les valeurs suivantes en production :

```env
JWT_SECRET=<générer-un-secret-fort-et-aléatoire>
MONGODB_URI=mongodb://<user>:<password>@<host>:<port>/<database>
```

### Recommandations de sécurité

1. **JWT Secret** : Utiliser un secret fort et aléatoire (min 32 caractères)
2. **MongoDB** : Changer les credentials par défaut
3. **HTTPS** : Utiliser un reverse proxy (Nginx, Traefik) avec SSL/TLS
4. **Rate Limiting** : Implémenter une limitation de requêtes
5. **CORS** : Configurer les origines autorisées
6. **Logs** : Centraliser les logs (ELK, Grafana Loki)
7. **Monitoring** : Implémenter un système de monitoring (Prometheus, Grafana)

---

## 👥 Rôles et Permissions

### USER (Défaut)
- ✅ Créer des observations
- ✅ Créer des espèces
- ✅ Consulter les espèces et observations validées
- ❌ Valider/rejeter des observations
- ❌ Accéder aux fonctions de modération

### EXPERT
- ✅ Toutes les permissions USER
- ✅ Valider des observations
- ✅ Rejeter des observations
- ✅ Consulter l'historique des espèces
- ❌ Supprimer des observations/espèces
- ❌ Gérer les utilisateurs

### ADMIN
- ✅ Toutes les permissions EXPERT
- ✅ Supprimer des observations (soft delete)
- ✅ Supprimer des espèces (soft delete)
- ✅ Restaurer des observations
- ✅ Consulter l'historique des utilisateurs
- ✅ Modifier les rôles des utilisateurs

---

## 🔧 Structure du Projet

```
Projet_Backend/
├── docs/
│   ├── ARCHITECTURE.md         # Diagrammes d'architecture
│   └── DATABASE.md             # Schéma de base de données
│
├── auth-service/
│   ├── src/
│   │   ├── config/             # Configuration DB
│   │   ├── controllers/        # Logique métier
│   │   ├── middleware/         # Middlewares (auth, validation)
│   │   ├── model/              # Modèles Mongoose
│   │   ├── routes/             # Définition des routes
│   │   └── app.js              # Point d'entrée
│   ├── swagger.yaml            # Documentation OpenAPI
│   ├── Dockerfile
│   └── package.json
│
├── observation-service/
│   ├── src/
│   │   ├── config/             # Configuration DB
│   │   ├── controllers/        # Logique métier
│   │   ├── middlewares/        # Middlewares (auth)
│   │   ├── models/             # Modèles Mongoose
│   │   ├── routes/             # Définition des routes
│   │   ├── services/           # Services métier
│   │   └── server.js           # Point d'entrée
│   ├── swagger.yaml            # Documentation OpenAPI
│   ├── Dockerfile
│   └── package.json
│
├── taxonomy-service/
│   ├── src/
│   │   ├── controllers/        # Logique métier
│   │   ├── middlewares/        # Middlewares (auth)
│   │   ├── routes/             # Définition des routes
│   │   ├── services/           # Services métier
│   │   └── server.js           # Point d'entrée
│   ├── swagger.yaml            # Documentation OpenAPI
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yaml         # Orchestration des services
├── Postman_Collection_Complete_Niveau_16.json
└── README.md                   # Ce fichier
```

---

## 📝 Règles Métier

### Système de Réputation

- **Création d'observation** : Aucun impact
- **Validation d'observation** : Gain de points pour l'auteur
- **Rejet d'observation** : Aucun impact (pour éviter la démotivation)
- **Réputation minimale** : 0 (pas de valeur négative)

### Score de Rareté (rarityScore)

Calculé automatiquement pour chaque espèce :
- Formule : `(1 + nombred'ObservationsValidées / 5)`
- Recalculé à chaque validation d'observation
- Plus une espèce a d'observations, plus son score diminue
- Utilisé pour identifier les espèces rares vs communes

### Règle des 5 Minutes

Un utilisateur ne peut pas créer plusieurs observations de la même espèce dans un intervalle de 5 minutes. Cette règle :
- Évite le spam
- Encourage des observations de qualité
- Prévient l'inflation artificielle du nombre d'observations

### Soft Delete

Toutes les suppressions sont "logiques" :
- Les enregistrements ne sont jamais physiquement supprimés
- `deletedAt` et `deletedBy` permettent la traçabilité
- Les ADMIN peuvent restaurer les enregistrements supprimés
- Garantit l'intégrité de l'historique

---

## 🐛 Dépannage

### Le service ne démarre pas

```bash
# Vérifier les logs
docker-compose logs [service-name]

# Rebuild complet
docker-compose down
docker-compose up -d --build
```

### Erreur de connexion MongoDB

```bash
# Vérifier que MongoDB est démarré
docker-compose ps

# Vérifier les credentials dans .env
cat auth-service/.env
```

### Token JWT invalide

- Vérifier que `JWT_SECRET` est identique dans tous les services
- Vérifier la validité du token (expiration)
- Vérifier le format : `Authorization: Bearer <token>`

---

## 📞 Support

Pour toute question ou problème :
- Consulter la documentation API (Swagger)
- Vérifier les logs des services
- Consulter les diagrammes d'architecture
- Vérifier les exemples dans la collection Postman

---

## 📄 Licence

Ce projet est développé dans un cadre éducatif.

---

## 🔗 Liens Utiles

- [Auth Service API](./auth-service/swagger.yaml)
- [Observation Service API](./observation-service/swagger.yaml)
- [Taxonomy Service API](./taxonomy-service/swagger.yaml)
- [Collection Postman](./Postman_Collection_Complete_Niveau_16.json)

---