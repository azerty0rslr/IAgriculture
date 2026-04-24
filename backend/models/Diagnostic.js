const mongoose = require('mongoose');

const DiagnosticSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  parcelleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Parcelle' },
  typeCulture: { type: String, required: true },
  donneesEntree: {
    temperature: Number,
    humidite: Number,
    ph: Number,
    symptomes: [String], // ex: ['taches_jaunes', 'feuilles_seches']
    imageUrl: String
  },
  resultatIA: {
    maladie: { type: String },
    probabilite: { type: Number, min: 0, max: 100 }, // en %
    confiance: { type: Number, min: 0, max: 100 },
    recommandation: { type: String },
    traitements: [String]
  },
  statut: {
    type: String,
    enum: ['en_attente', 'traite', 'erreur'],
    default: 'en_attente'
  },
  dateCreation: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Diagnostic', DiagnosticSchema);
