const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Diagnostic = require('../models/Diagnostic');
const Parcelle = require('../models/Parcelle');
const { proteger, adminSeulement } = require('../middleware/auth');

// Toutes les routes admin nécessitent authentification + rôle admin
router.use(proteger, adminSeulement);

/**
 * GET /api/admin/users
 * Récupère la liste des users inscrits
 */
router.get('/users', async (req, res) => {
  try {
    const users = await User.find()
      .select('-motDePasse')     
      .sort({ dateCreation: -1 }); 
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

/**
 * PUT /api/admin/users/:id/activer
 * Active ou désactive le compte d'un utilisateur (si inactif)
 */
router.put('/users/:id/activer', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,      
      { actif: req.body.actif },  
      { new: true }   
    ).select('-motDePasse');
    res.json({ message: 'Statut mis à jour.', user });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

/**
 * DELETE /api/admin/users/:id
 * Supprime un user et toutes ses données (parcelles et diagnostics)
 */
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

/**
 * GET /api/admin/stats
 * Retourne les statistiques de la plateforme
 */
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

// Export du routeur pour intégration sur serveur principal
module.exports = router;