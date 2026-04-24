const express = require('express');
const router = express.Router();
const Parcelle = require('../models/Parcelle');
const Diagnostic = require('../models/Diagnostic');
const { proteger } = require('../middleware/auth');

// GET /api/dashboard - Stats globales de l'utilisateur
router.get('/', proteger, async (req, res) => {
  try {
    const [parcelles, diagnosticsRecents, totalDiagnostics] = await Promise.all([
      Parcelle.find({ userId: req.user._id }),
      Diagnostic.find({ userId: req.user._id }).sort({ dateCreation: -1 }).limit(5).populate('parcelleId', 'nom'),
      Diagnostic.countDocuments({ userId: req.user._id })
    ]);

    const alertes = parcelles.flatMap(p =>
      p.alertes.filter(a => !a.lue).map(a => ({ ...a.toObject(), parcelle: p.nom }))
    );

    const stats = {
      totalParcelles: parcelles.length,
      totalSurface: parcelles.reduce((sum, p) => sum + (p.surface || 0), 0),
      totalDiagnostics,
      parcellesParRisque: {
        faible: parcelles.filter(p => p.niveauRisque === 'faible').length,
        moyen: parcelles.filter(p => p.niveauRisque === 'moyen').length,
        eleve: parcelles.filter(p => p.niveauRisque === 'eleve').length,
        critique: parcelles.filter(p => p.niveauRisque === 'critique').length,
      },
      alertesNonLues: alertes.length
    };

    res.json({ stats, diagnosticsRecents, alertes: alertes.slice(0, 5) });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: err.message });
  }
});

module.exports = router;
