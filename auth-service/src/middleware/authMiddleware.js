const jwt = require("jsonwebtoken");
const { findByEmailOrUsername } = require("../data/users");

const JWT_SECRET = process.env.JWT_SECRET || "DEV_SECRET_CHANGE_ME";
const JWT_EXPIRES_IN = "1h";

function generateToken(user) {
  const payload = {
    sub: user.id,
    email: user.email,
    username: user.username,
    role: user.role
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

async function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  const [type, token] = authHeader.split(" ");
  if (type !== "Bearer" || !token) {
    return res.status(401).json({ error: "Invalid Authorization format" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Dans un vrai projet, on irait chercher l'utilisateur en DB par decoded.sub
    const user = findByEmailOrUsername(decoded.email);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role
    };
    next();
  } catch (err) {
    console.error("JWT error:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ error: "User not authenticated (no user on request)" });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden: insufficient role" });
    }
    next();
  };
}

module.exports = {
  authMiddleware,
  generateToken,
  requireRole
};
