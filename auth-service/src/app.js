require('dotenv').config();

const express = require('express');
const { connectDB } = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const protectedRoutes = require('./routes/protectedRoutes');
const { authMiddleware } = require('./middleware/authMiddleware');

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route de santé
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        service: 'auth-service',
        timestamp: new Date().toISOString()
    });
});

// Routes publiques
app.use('/auth', authRoutes);

// Routes protégées
app.use('/api', authMiddleware, protectedRoutes);

// Gestion des erreurs (middleware d'erreur)
app.use((err, req, res, next) => {
    console.error('Erreur:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Erreur interne du serveur'
    });
});

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        await connectDB();
        
        app.listen(PORT, () => {
            console.log(`Serveur auth-service démarré au port ${PORT}`);
        });
    } catch (error) {
        console.error('Erreur au démarrage du serveur:', error);
        process.exit(1);
    }
}

startServer();

module.exports = app;