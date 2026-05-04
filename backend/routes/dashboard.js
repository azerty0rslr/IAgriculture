const express = require('express');
const router = express.Router();
const Parcelle = require('../models/Parcelle');  
const Diagnostic = require('../models/Diagnostic'); 
const { proteger } = require('../middleware/auth'); 

/**
 * GET /api/dashboard
 * Retourne les statistiques, les diagnostics et les alertes
 */
router.get('/', proteger, async (req, res) => {
  try {
    const [parcelles, diagnosticsRecents, totalDiagnostics] = await Promise.all([
      // Récupération des parcelles du user
      Parcelle.find({ userId: req.user._id }),
      Diagnostic.find({ userId: req.user._id }).sort({ dateCreation: -1 }).limit(5).populate('parcelleId', 'nom'),   
      // Compte le nbr de diagnostics
      Diagnostic.countDocuments({ userId: req.user._id })
    ]);

    // Toutes les alertes non lues
    const alertes = parcelles.flatMap(p =>
      p.alertes.filter(a => !a.lue).map(a => ({ ...a.toObject(), parcelle: p.nom })) 
    );

    // Résumé de l'activité du user
    const stats = {
      // Nbr de parcelles
      totalParcelles: parcelles.length,
      // Surface des parcelles
      totalSurface: parcelles.reduce((sum, p) => sum + (p.surface || 0), 0),
      // Nbr de diagnostics
      totalDiagnostics,

      // Parcelles triées par niveau de risque
      parcellesParRisque: {
        faible:   parcelles.filter(p => p.niveauRisque === 'faible').length,
        moyen:    parcelles.filter(p => p.niveauRisque === 'moyen').length,
        eleve:    parcelles.filter(p => p.niveauRisque === 'eleve').length,
        critique: parcelles.filter(p => p.niveauRisque === 'critique').length,
      },

      // Nbr d'alertes non lues
      alertesNonLues: alertes.length
    };

    // Retour des statistiques, diagnostics et alertes
    res.json({stats, diagnosticsRecents, alertes: alertes.slice(0, 5)
});
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: err.message });
  }
});

// Export du routeur pour intégration sur serveur principal
module.exports = router;