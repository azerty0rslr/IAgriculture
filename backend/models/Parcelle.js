const mongoose = require('mongoose');

// Contient les informations géographiques, les données capteurs IoT (simulées pour le MVP) et les alertes IA

const ParcelleSchema = new mongoose.Schema({

  // Nom de la parcelle 
  nom: { type: String, required: true },

  // Référence vers l'utilisateur
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Surface de la parcelle
  surface: { type: Number, required: true },

  // Type de culture
  culture: { type: String, required: true },

  // Coordonnées GPS pour la carte
  coordonnees: {
    lat: { type: Number, required: true }, // Latitude
    lng: { type: Number, required: true }  // Longitude
  },

  // Données collectées par les capteurs IoT (simulées)
  donneesCapeurs: {
    temperature: { type: Number },  
    humidite: { type: Number },   
    ph: { type: Number },   
    luminosite: { type: Number },  
    derniereMiseAJour: { type: Date, default: Date.now } 
  },

  // Niveau de risque calculé par l'IA
  niveauRisque: {
    type: String,
    enum: ['faible', 'moyen', 'eleve', 'critique'], 
    default: 'faible'         
  },

  // Liste des alertes générées par l'IA 
  alertes: [{
    message: String, 
    type: { 
      type: String, 
      enum: ['info', 'warning', 'danger'] 
    },
    date: { type: Date, default: Date.now }, 
    lue: { type: Boolean, default: false } 
  }],

  // Date de création de parcelle
  dateCreation: { type: Date, default: Date.now }
});

// Export du modèle pour utilisation sur routes et services
module.exports = mongoose.model('Parcelle', ParcelleSchema);