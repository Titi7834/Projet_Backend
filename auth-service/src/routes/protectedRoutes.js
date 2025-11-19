const express = require("express");
const router = express.Router();
const { getAllUsersSafe } = require("../data/users");
const { requireRole } = require("../middleware/authMiddleware");

// Exemple de données métier
let ideas = [
  { id: 1, title: "Idée publique", author: "admin" }
];

// Route générique pour voir qui est connecté
router.get("/me", (req, res) => {
  res.json({
    message: "You are authenticated",
    user: req.user
  });
});

// Route accessible à tout utilisateur connecté (USER ou ADMIN)
router.get("/ideas", (req, res) => {
  res.json(ideas);
});


// Route d'admin : voir tous les utilisateurs
router.get("/admin/users", requireRole("ADMIN"), (req, res) => {
  const users = getAllUsersSafe();
  res.json(users);
});

module.exports = router;
