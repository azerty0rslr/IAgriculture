const express = require('express');
const router = express.Router();
const Diagnostic = require('../models/Diagnostic');
const { proteger } = require('../middleware/auth');

// Simulation du modèle IA (à remplacer par appel Python/scikit-learn ou OpenAI)
const simulerIA = (donnees) => {
  const { temperature, humidite, ph, symptomes } = donnees;

  const maladies = [
    { nom: 'Mildiou', probabilite: 0, conditions: { humiditeMin: 70, tempMax: 25 } },
    { nom: 'Oïdium', probabilite: 0, conditions: { humiditeMax: 60, tempMin: 20 } },
    { nom: 'Rouille foliaire', probabilite: 0, conditions: { humiditeMin: 60, tempMin: 15, tempMax: 22 } },
    { nom: 'Chlorose ferrique', probabilite: 0, conditions: { phMax: 6.5 } },
  ];

  let maladieDetectee = { maladie: 'Aucune maladie détectée', probabilite: 5, confiance: 90 };

  if (humidite >= 70 && temperature <= 25) {
    maladieDetectee = { maladie: 'Mildiou', probabilite: Math.min(95, 50 + (humidite - 70)), confiance: 85 };
  } else if (humidite <= 60 && temperature >= 20) {
    maladieDetectee = { maladie: 'Oïdium', probabilite: Math.min(90, 40 + (temperature - 20) * 3), confiance: 78 };
  } else if (ph <= 6.5) {
    maladieDetectee = { maladie: 'Chlorose ferrique', probabilite: Math.min(88, 60 + (6.5 - ph) * 20), confiance: 82 };
  }

  // Bonus probabilité selon symptomes déclarés
  if (symptomes && symptomes.length > 0) {
    maladieDetectee.probabilite = Math.min(99, maladieDetectee.probabilite + symptomes.length * 5);
  }

  const recommandations = {
    'Mildiou': 'Appliquer un fongicide à base de cuivre. Améliorer la ventilation. Éviter l\'arrosage le soir.',
    'Oïdium': 'Traitement soufré préventif. Réduire l\'azote. Augmenter l\'espacement entre plants.',
    'Chlorose ferrique': 'Apport de chélate de fer. Vérifier et ajuster le pH du sol (cible 6.5-7).',
    'Rouille foliaire': 'Fongicide triazole recommandé. Rotation des cultures conseillée.',
    'Aucune maladie détectée': 'Culture en bonne santé. Continuer la surveillance régulière.'
  };

  return {
    ...maladieDetectee,
    recommandation: recommandations[maladieDetectee.maladie] || 'Consulter un agronome.',
    traitements: maladieDetectee.maladie !== 'Aucune maladie détectée'
      ? ['Traitement chimique', 'Surveillance renforcée', 'Rapport agronome']
      : ['Surveillance standard']
  };
};

// POST /api/diagnostics - Nouveau diagnostic
router.post('/', proteger, async (req, res) => {
  try {
    const { typeCulture, parcelleId, donneesEntree } = req.body;

    const resultatIA = simulerIA(donneesEntree);

    const diagnostic = await Diagnostic.create({
      userId: req.user._id,
      parcelleId,
      typeCulture,
      donneesEntree,
      resultatIA,
      statut: 'traite'
    });

    res.status(201).json({ message: 'Diagnostic effectué.', diagnostic });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors du diagnostic.', erreur: err.message });
  }
});

// GET /api/diagnostics - Historique des diagnostics
router.get('/', proteger, async (req, res) => {
  try {
    const diagnostics = await Diagnostic.find({ userId: req.user._id })
      .populate('parcelleId', 'nom culture')
      .sort({ dateCreation: -1 })
      .limit(20);

    res.json({ diagnostics });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: err.message });
  }
});

// GET /api/diagnostics/:id
router.get('/:id', proteger, async (req, res) => {
  try {
    const diagnostic = await Diagnostic.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('parcelleId', 'nom culture coordonnees');

    if (!diagnostic) return res.status(404).json({ message: 'Diagnostic introuvable.' });
    res.json({ diagnostic });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: err.message });
  }
});

module.exports = router;
