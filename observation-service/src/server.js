import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import speciesRoutes from './routes/species.routes.js';
import observationRoutes from './routes/observation.routes.js';

// Charger les variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/species', speciesRoutes);
app.use('/api/observations', observationRoutes);

// Route de santé
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'observation-service',
    timestamp: new Date().toISOString()
  });
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error('Erreur:', err);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

// Démarrage du serveur
const startServer = async () => {
  try {
    // Connexion à MongoDB
    await connectDB();

    // Démarrage du serveur
    app.listen(PORT, () => {
      console.log(`🚀 observation-service démarré sur le port ${PORT}`);
      console.log(`📍 http://localhost:${PORT}`);
      console.log(`💚 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Erreur au démarrage:', error);
    process.exit(1);
  }
};

startServer();
