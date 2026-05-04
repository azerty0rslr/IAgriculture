const express = require('express');
const router = express.Router();
const Parcelle = require('../models/Parcelle');    
const { proteger } = require('../middleware/auth'); 

/**
 * GET /api/parcelles
 * Retourne toutes les parcelles du user
 */
router.get('/', proteger, async (req, res) => {
  try {
    const parcelles = await Parcelle.find({ userId: req.user._id })
      .sort({ dateCreation: -1 }); 
    res.json({ parcelles });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: err.message });
  }
});

/**
 * POST /api/parcelles
 * Crée une nouvelle parcelle pour le user
 */
router.post('/', proteger, async (req, res) => {
  try {
    // Fusion de la requête avec l'ID du user
    const parcelle = await Parcelle.create({ ...req.body, userId: req.user._id });
    res.status(201).json({ message: 'Parcelle créée.', parcelle });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la création.', erreur: err.message });
  }
});

/**
 * PUT /api/parcelles/:id
 * MAJ des info d'une parcelle
 */
router.put('/:id', proteger, async (req, res) => {
  try {
    const parcelle = await Parcelle.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,  
      { new: true }  
    );
    // Si aucune parcelle correspond
    if (!parcelle) return res.status(404).json({ message: 'Parcelle introuvable.' });
    res.json({ message: 'Parcelle mise à jour.', parcelle });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: err.message });
  }
});

/**
 * DELETE /api/parcelles/:id
 * Supprime une parcelle appartenant au user
 */
router.delete('/:id', proteger, async (req, res) => {
  try {
    const parcelle = await Parcelle.findOneAndDelete(
      { _id: req.params.id, userId: req.user._id } 
    );
    if (!parcelle) return res.status(404).json({ message: 'Parcelle introuvable.' });
    res.json({ message: 'Parcelle supprimée.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: err.message });
  }
});

/**
 * POST /api/parcelles/:id/capteurs
 * MAJ des données capteurs IoT d'une parcelle (simulés pour le MVP)
 */
router.post('/:id/capteurs', proteger, async (req, res) => {
  try {
    const { temperature, humidite, ph, luminosite } = req.body;

    let niveauRisque = 'faible'; 

    if (humidite > 85 || temperature > 35 || ph < 5.5 || ph > 8)
      niveauRisque = 'critique'; // Conditions extrêmes (alerte urgente)
    else if (humidite > 75 || temperature > 30)
      niveauRisque = 'eleve';   // Conditions dangereuses (à surveiller)
    else if (humidite > 65 || temperature > 28)
      niveauRisque = 'moyen';   // OK

    // MAJ des données capteurs et du niveau de risque
    const parcelle = await Parcelle.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      {
        donneesCapeurs: {
          temperature,
          humidite,
          ph,
          luminosite,
          derniereMiseAJour: new Date() 
        },
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

// Export du routeur pour intégration sur serveur principal
module.exports = router;