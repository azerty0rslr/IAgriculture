const express = require('express');
const router = express.Router();
const Parcelle = require('../models/Parcelle');
const { proteger } = require('../middleware/auth');

// GET /api/parcelles
router.get('/', proteger, async (req, res) => {
  try {
    const parcelles = await Parcelle.find({ userId: req.user._id }).sort({ dateCreation: -1 });
    res.json({ parcelles });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: err.message });
  }
});

// POST /api/parcelles
router.post('/', proteger, async (req, res) => {
  try {
    const parcelle = await Parcelle.create({ ...req.body, userId: req.user._id });
    res.status(201).json({ message: 'Parcelle créée.', parcelle });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la création.', erreur: err.message });
  }
});

// PUT /api/parcelles/:id
router.put('/:id', proteger, async (req, res) => {
  try {
    const parcelle = await Parcelle.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!parcelle) return res.status(404).json({ message: 'Parcelle introuvable.' });
    res.json({ message: 'Parcelle mise à jour.', parcelle });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: err.message });
  }
});

// DELETE /api/parcelles/:id
router.delete('/:id', proteger, async (req, res) => {
  try {
    const parcelle = await Parcelle.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!parcelle) return res.status(404).json({ message: 'Parcelle introuvable.' });
    res.json({ message: 'Parcelle supprimée.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: err.message });
  }
});

// POST /api/parcelles/:id/capteurs - Mise à jour données capteurs (simulation IoT)
router.post('/:id/capteurs', proteger, async (req, res) => {
  try {
    const { temperature, humidite, ph, luminosite } = req.body;

    // Calcul automatique du niveau de risque
    let niveauRisque = 'faible';
    if (humidite > 85 || temperature > 35 || ph < 5.5 || ph > 8) niveauRisque = 'critique';
    else if (humidite > 75 || temperature > 30) niveauRisque = 'eleve';
    else if (humidite > 65 || temperature > 28) niveauRisque = 'moyen';

    const parcelle = await Parcelle.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      {
        donneesCapeurs: { temperature, humidite, ph, luminosite, derniereMiseAJour: new Date() },
        niveauRisque
      },
      { new: true }
    );

    if (!parcelle) return res.status(404).json({ message: 'Parcelle introuvable.' });
    res.json({ message: 'Données capteurs mises à jour.', parcelle });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: err.message });
  }
});

module.exports = router;
