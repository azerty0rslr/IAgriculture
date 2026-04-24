const mongoose = require('mongoose');

const ParcelleSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  surface: { type: Number, required: true }, // en hectares
  culture: { type: String, required: true }, // blé, maïs, tomate...
  coordonnees: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  donneesCapeurs: {
    temperature: { type: Number },
    humidite: { type: Number },
    ph: { type: Number },
    luminosite: { type: Number },
    derniereMiseAJour: { type: Date, default: Date.now }
  },
  niveauRisque: {
    type: String,
    enum: ['faible', 'moyen', 'eleve', 'critique'],
    default: 'faible'
  },
  alertes: [{
    message: String,
    type: { type: String, enum: ['info', 'warning', 'danger'] },
    date: { type: Date, default: Date.now },
    lue: { type: Boolean, default: false }
  }],
  dateCreation: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Parcelle', ParcelleSchema);
