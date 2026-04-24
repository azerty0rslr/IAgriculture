const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Diagnostic = require('../models/Diagnostic');
const Parcelle = require('../models/Parcelle');
const { proteger, adminSeulement } = require('../middleware/auth');

// Toutes les routes admin nécessitent authentification + rôle admin
router.use(proteger, adminSeulement);

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-motDePasse').sort({ dateCreation: -1 });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// PUT /api/admin/users/:id/activer
router.put('/users/:id/activer', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { actif: req.body.actif }, { new: true }).select('-motDePasse');
    res.json({ message: 'Statut mis à jour.', user });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Parcelle.deleteMany({ userId: req.params.id });
    await Diagnostic.deleteMany({ userId: req.params.id });
    res.json({ message: 'Utilisateur supprimé.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalDiagnostics, totalParcelles] = await Promise.all([
      User.countDocuments(),
      Diagnostic.countDocuments(),
      Parcelle.countDocuments()
    ]);
    res.json({ totalUsers, totalDiagnostics, totalParcelles });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router;
