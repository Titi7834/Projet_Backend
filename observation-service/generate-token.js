import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'votre-secret-jwt-super-securise';

// Génère un token pour un utilisateur normal
const userToken = jwt.sign(
  { id: 'user123', role: 'USER' },
  JWT_SECRET,
  { expiresIn: '24h' }
);

// Génère un token pour un expert
const expertToken = jwt.sign(
  { id: 'expert456', role: 'EXPERT' },
  JWT_SECRET,
  { expiresIn: '24h' }
);

// Génère un token pour un admin
const adminToken = jwt.sign(
  { id: 'admin789', role: 'ADMIN' },
  JWT_SECRET,
  { expiresIn: '24h' }
);

console.log('\n=== TOKENS JWT POUR POSTMAN ===\n');
console.log('🔵 USER Token (pour créer des espèces et observations):');
console.log(userToken);
console.log('\n🟢 EXPERT Token (pour valider/rejeter des observations):');
console.log(expertToken);
console.log('\n🔴 ADMIN Token (accès complet):');
console.log(adminToken);
console.log('\n');
