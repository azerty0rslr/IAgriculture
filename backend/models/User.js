const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  nom: { type: String, required: true, trim: true },
  prenom: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  motDePasse: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['agriculteur', 'admin'], default: 'agriculteur' },
  localisation: {
    region: { type: String },
    coordonnees: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  dateCreation: { type: Date, default: Date.now },
  actif: { type: Boolean, default: true }
});

// Hash le mot de passe avant sauvegarde
UserSchema.pre('save', async function (next) {
  if (!this.isModified('motDePasse')) return next();
  this.motDePasse = await bcrypt.hash(this.motDePasse, 12);
  next();
});

// Méthode de vérification du mot de passe
UserSchema.methods.verifierMotDePasse = async function (motDePasse) {
  return await bcrypt.compare(motDePasse, this.motDePasse);
};

module.exports = mongoose.model('User', UserSchema);
