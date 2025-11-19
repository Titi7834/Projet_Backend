const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const protectedRoutes = require("./routes/protectedRoutes");
const { authMiddleware } = require("./middleware/authMiddleware");

const app = express();

app.use(cors());
app.use(express.json());

// Route publique de base
app.get("/", (req, res) => {
  res.json({
    message: "Exemple API Express avec JWT + rôles",
    login: "/auth/login",
    docs: "Voir README pour les exemples d'appels"
  });
});

// Routes d'auth
app.use("/auth", authRoutes);

// Routes protégées (nécessitent JWT)
app.use("/api", authMiddleware, protectedRoutes);

// Gestion d'erreurs générique
app.use((err, req, res, next) => {
  console.error("Unexpected error:", err);
  res.status(500).json({ error: "Internal server error" });
});

module.exports = app;
