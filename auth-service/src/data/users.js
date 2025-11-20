// Le mot de passe en clair pour les 2 comptes est: "secret123"

const users = [
  {
    id: 1,
    email: "admin@example.com",
    username: "admin",
    role: "ADMIN",
    // hash de "secret123"
    passwordHash: "$2b$10$c5rDUw65IiB7GaNTikN42.XMH4FxAXengbFDCjHN1M4z27yLQ0X.y"
  },
  {
    id: 2,
    email: "user@example.com",
    username: "user",
    role: "USER",
    // hash de "secret123"
    passwordHash: "$2b$10$c5rDUw65IiB7GaNTikN42.XMH4FxAXengbFDCjHN1M4z27yLQ0X.y"
  }
];

function findByEmailOrUsername(identifier) {
  return users.find(
    (u) => u.email === identifier || u.username === identifier
  );
}

function getAllUsersSafe() {
  // Sans les hashes pour les réponses API
  return users.map(({ passwordHash, ...rest }) => rest);
}

module.exports = {
  users,
  findByEmailOrUsername,
  getAllUsersSafe
};
