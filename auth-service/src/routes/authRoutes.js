const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const { findByEmailOrUsername } = require("../data/users");
const { generateToken } = require("../middleware/authMiddleware");

/**
 * POST /auth/login
 * Body: { "identifier": "email or username", "password": "secret123" }
 */
router.post("/login", async (req, res) => {
  const { identifier, password } = req.body;
  
  if (!identifier || !password) {
    return res
      .status(400)
      .json({ error: "identifier and password are required" });
  }

  const user = findByEmailOrUsername(identifier);
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  
const isValid = testCompare(password, user.passwordHash);
if (!isValid) {
  return res.status(401).json({ error: "Invalid credentials" });
}


  const token = generateToken(user);

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role
    }
  });
});

async function testCompare(mdp, mdpHash) {
  try {
    const match = await bcrypt.compare(mdp, mdpHash);
    return match
  } catch (e) {
    console.error("Bcrypt error:", e);
    return false;
  }
};

module.exports = router;
