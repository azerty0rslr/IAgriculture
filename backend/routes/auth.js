const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { proteger } = require('../middleware/auth');

const genererToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'agri_ia_secret_key_2025', {
    expiresIn: '7d'
  });
};

// POST /api/auth/inscription
router.post('/inscription', async (req, res) => {
  try {
    const { nom, prenom, email, motDePasse, region } = req.body;

    const existant = await User.findOne({ email });
    if (existant) {
      return res.status(400).json({ message: 'Email déjà utilisé.' });
    }

    const user = await User.create({
      nom, prenom, email, motDePasse,
      localisation: { region }
    });

    res.status(201).json({
      message: 'Compte créé avec succès.',
      token: genererToken(user._id),
      user: { id: user._id, nom: user.nom, prenom: user.prenom, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: err.message });
  }
});

// POST /api/auth/connexion
router.post('/connexion', async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.verifierMotDePasse(motDePasse))) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    res.json({
      token: genererToken(user._id),
      user: { id: user._id, nom: user.nom, prenom: user.prenom, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: err.message });
  }
});

// GET /api/auth/moi
router.get('/moi', proteger, async (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
