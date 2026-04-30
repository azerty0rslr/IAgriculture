// ─────────────────────────────────────────────────────────
// AgriIA — Serveur principal Node.js + Express
// ─────────────────────────────────────────────────────────

// Importation des modules nécessaires
const express = require('express');        // Framework web Node.js
const cors = require('cors');              // Autoriser les requêtes cross-origin (frontend → backend)
const mongoose = require('mongoose');      // ODM pour communiquer avec MongoDB
const dotenv = require('dotenv');          // Charger les variables d'environnement depuis .env
const rateLimit = require('express-rate-limit'); // Protection contre les attaques par force brute
const helmet = require('helmet');          // Sécurisation des headers HTTP

// Chargement des variables d'environnement (.env)
dotenv.config();

// Initialisation de l'application Express
const app = express();

// Nécessaire pour Render (reverse proxy) — permet à express-rate-limit
// d'identifier correctement les IPs via le header X-Forwarded-For
app.set('trust proxy', 1);

// Port d'écoute du serveur (5000 par défaut ou défini dans .env)
const PORT = process.env.PORT || 5000;

// ─────────────────────────────────────────────────────────
// RATE LIMITING — Protection contre les attaques
// ─────────────────────────────────────────────────────────

// Limite globale : 100 requêtes maximum par IP toutes les 15 minutes
// Appliquée sur toutes les routes de l'application
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // Fenêtre de temps : 15 minutes en millisecondes
    max: 100,                  // Nombre maximum de requêtes autorisées par IP
    message: { message: 'Trop de requêtes, réessaie dans 15 minutes.' }
});

// Limite stricte sur l'authentification : 10 tentatives par 15 minutes
// Empêche les attaques par force brute sur les mots de passe
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // Fenêtre de temps : 15 minutes
    max: 10,                   // Seulement 10 tentatives de connexion autorisées
    message: { message: 'Trop de tentatives de connexion, réessaie dans 15 minutes.' }
});

// ─────────────────────────────────────────────────────────
// MIDDLEWARE GLOBAUX
// ─────────────────────────────────────────────────────────

// Autorise les requêtes venant du frontend (React sur localhost:3000 ou Vercel)
app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Sécurise les headers HTTP (protection XSS, clickjacking, MIME sniffing, etc.)
app.use(helmet());

// Permet de lire le corps des requêtes au format JSON
app.use(express.json());

// Application du limiteur global sur toutes les routes
app.use(globalLimiter);

// ─────────────────────────────────────────────────────────
// IMPORTATION DES ROUTES
// ─────────────────────────────────────────────────────────

const authRoutes = require('./routes/auth');           // Routes : inscription, connexion, profil
const diagnosticRoutes = require('./routes/diagnostics'); // Routes : diagnostic IA (OpenAI)
const parcellesRoutes = require('./routes/parcelles'); // Routes : gestion des parcelles agricoles
const dashboardRoutes = require('./routes/dashboard'); // Routes : statistiques tableau de bord
const adminRoutes = require('./routes/admin');         // Routes : administration (rôle admin uniquement)

// ─────────────────────────────────────────────────────────
// RATE LIMITING SPÉCIFIQUE — Authentification
// ─────────────────────────────────────────────────────────

// Applique la limite stricte sur la connexion (10 tentatives max)
app.use('/api/auth/connexion', authLimiter);

// Applique la limite stricte sur l'inscription (évite la création massive de faux comptes)
app.use('/api/auth/inscription', authLimiter);

// ─────────────────────────────────────────────────────────
// DÉCLARATION DES ROUTES API
// ─────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);              // /api/auth/inscription, /api/auth/connexion, /api/auth/moi
app.use('/api/diagnostics', diagnosticRoutes); // /api/diagnostics (POST, GET)
app.use('/api/parcelles', parcellesRoutes);    // /api/parcelles (CRUD + capteurs IoT)
app.use('/api/dashboard', dashboardRoutes);    // /api/dashboard (stats globales)
app.use('/api/admin', adminRoutes);            // /api/admin/users (gestion utilisateurs)

// ─────────────────────────────────────────────────────────
// CONNEXION À MONGODB ATLAS
// ─────────────────────────────────────────────────────────

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB connecté'))
    .catch((err) => console.error('❌ Erreur MongoDB:', err));

// ─────────────────────────────────────────────────────────
// ROUTE DE SANTÉ — Health Check
// ─────────────────────────────────────────────────────────

// Permet de vérifier que le serveur tourne correctement
// Accessible sur : GET /api/health
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ─────────────────────────────────────────────────────────
// DÉMARRAGE DU SERVEUR
// ─────────────────────────────────────────────────────────

app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});

module.exports = app;