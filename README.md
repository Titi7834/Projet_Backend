# Blog MERN - Auth Service

Service d'authentification pour un système de blog avec architecture microservices.

## Fonctionnalités Implémentées

### Routes d'Authentification (Publiques)
- ✅ `POST /auth/register` - Créer un nouvel utilisateur
- ✅ `POST /auth/login` - Authentifier un utilisateur
- ✅ `GET /auth/me` - Récupérer les infos de l'utilisateur connecté (authentifié)

### Routes Admin (Protégées)
- ✅ `GET /api/admin/users` - Récupérer tous les utilisateurs (ADMIN)
- ✅ `PATCH /api/users/:id/role` - Modifier le rôle d'un utilisateur (ADMIN)

### Sécurité
- ✅ Hash des mots de passe avec bcrypt (10 salt rounds)
- ✅ JWT pour l'authentification (7 jours d'expiration)
- ✅ Rôles (USER, EXPERT, ADMIN)
- ✅ Validation des rôles côté serveur
- ✅ Validation des emails

## Modèle User

```javascript
{
  _id: ObjectId,
  email: String (unique, validé),
  username: String (unique),
  password: String (hashé avec bcrypt, sélection: false),
  role: String (USER | EXPERT | ADMIN, default: USER),
  reputation: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

## Stack Technique

- **Backend**: Express.js 4.18.2
- **Base de Données**: MongoDB + Mongoose 8.0.0
- **Authentification**: JWT (jsonwebtoken 9.0.2)
- **Hashage**: bcrypt 5.1.0
- **Runtime**: Node.js 18+

## Installation

```bash
npm install
```

## Démarrage

### Mode Développement
```bash
npm run dev
```

### Mode Production
```bash
npm start
```

Le serveur démarre au port 3000 (configurable via PORT dans .env)

## Configuration - Variables d'Environnement

```
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://admin:adminpassword@localhost:27017/blog_mern?authSource=admin
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

## Exemples de Requêtes

### Register
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "john_doe",
    "password": "password123",
    "role": "USER"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Get Me (Authentifié)
```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer <TOKEN>"
```

### Get All Users (ADMIN)
```bash
curl -X GET http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

### Update User Role (ADMIN)
```bash
curl -X PATCH http://localhost:3000/api/users/<USER_ID>/role \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"role": "EXPERT"}'
```

## Structure du Projet

```
auth-service/
├── src/
│   ├── app.js                      # Application principale
│   ├── controllers/
│   │   ├── authController.js       # Logique: register, login, getMe
│   │   └── adminController.js      # Logique: admin routes
│   ├── middleware/
│   │   └── authMiddleware.js       # JWT verification, role checks
│   ├── models/
│   │   └── user.js                 # Schéma User + méthodes
│   ├── routes/
│   │   ├── authRoutes.js           # Routes publiques
│   │   └── protectedRoutes.js      # Routes protégées
│   └── config/
│       └── database.js             # Connexion MongoDB
├── package.json
├── .env
├── .gitignore
└── Dockerfile (optionnel)
```

## Points Clés de l'Implémentation

### 1. Hashage des Mots de Passe
- Middleware Mongoose `pre('save')` qui hash le mot de passe avant sauvegarde
- Utilisation de bcrypt avec 10 salt rounds
- Le mot de passe n'est jamais retourné aux clients

### 2. JWT Token
- Token généré au register et login
- Contient l'ID utilisateur
- Expire après 7 jours
- Vérifié à chaque requête protégée

### 3. Rôles et Permissions
- 3 rôles: USER, EXPERT, ADMIN
- Middleware `requireRole()` pour les vérifications
- ADMIN seul peut: voir les utilisateurs, modifier les rôles

### 4. Validation
- Email unique et validé par regex
- Username unique avec longueur min/max
- Rôles limités aux valeurs enum
- Réputation min: 0

## Gestion des Erreurs

Toutes les réponses suivent le format:

**Succès:**
```json
{
  "success": true,
  "message": "...",
  "user": {...},
  "token": "..."
}
```

**Erreur:**
```json
{
  "success": false,
  "message": "Description de l'erreur"
}
```

## Codes HTTP Utilisés

- 201: Utilisateur créé (register)
- 200: Requête réussie
- 400: Données invalides
- 401: Non authentifié / Token invalide
- 403: Non autorisé (rôle insuffisant)
- 404: Ressource non trouvée
- 409: Conflit (email/username déjà existant)
- 500: Erreur serveur