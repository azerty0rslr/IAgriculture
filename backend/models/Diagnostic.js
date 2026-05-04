const mongoose = require('mongoose');

// Stocke les données (capteurs, symptômes) et le résultat retourné par l'IA

const DiagnosticSchema = new mongoose.Schema({
  // Utilisateur (agriculteur) qui a lancé le diagnostic
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Référence de la parcelle (optionelle)
  parcelleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Parcelle' },
  // Type de culture
  typeCulture: { type: String, required: true },
  // Données d'entrée saisies manuellement - si poursuite du projet alors les remplacer par les données récoltées par l'IoT
  donneesEntree: {
    temperature: Number, 
    humidite: Number,    
    ph: Number,           
    symptomes: [String],  // ['taches_jaunes', 'feuilles_seches']
    imageUrl: String  
  },

  // Résultat retourné par le modèle d'OpenAI
  resultatIA: {
    maladie: { type: String },       
    probabilite: { type: Number, min: 0, max: 100 },  
    confiance: { type: Number, min: 0, max: 100 },  
    recommandation: { type: String },  
    traitements: [String]   
  },

  // Statut du diagnostic
  statut: {
    type: String,
    enum: ['en_attente', 'traite', 'erreur'], 
    default: 'en_attente'     
  },

  // Date de création du diagnostic
  dateCreation: { type: Date, default: Date.now }
});

// Export du modèle pour utilisation sur routes et services
module.exports = mongoose.model('Diagnostic', DiagnosticSchema);