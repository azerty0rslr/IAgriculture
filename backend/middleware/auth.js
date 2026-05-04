// Protège les routes sensibles et vérifie les droits d'accès des utilisateurs

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Vérifie que la requête contient un token JWT valide avant d'autoriser l'accès

const proteger = async (req, res, next) => {
  try {
    let token;

    // Récupère le token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Si aucun token, requête bloquée
    if (!token) {
      return res.status(401).json({ message: 'Accès refusé. Token manquant.' });
    }

    // Vérification du token avec la clé 
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'agri_ia_secret_key_2025');
    // Récupération de l'utilisateur en BDD à partir de l'ID (token)
    req.user = await User.findById(decoded.id).select('-motDePasse');

    // Vérification que l'utilisateur existe
    if (!req.user || !req.user.actif) {
      return res.status(401).json({ message: 'Utilisateur invalide ou désactivé.' });
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalide ou expiré.' });
  }
};

// Limite l'accès aux routes d'administration

const adminSeulement = (req, res, next) => {
  // Le rôle de l'utilisateur est bien "admin"
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Accès réservé aux administrateurs.' });
  }
  next();
};

module.exports = { proteger, adminSeulement };
