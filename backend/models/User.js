const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); 

// Gère les agriculteurs et les administrateurs avec authentification

const UserSchema = new mongoose.Schema({

  // Nom de famille user
  nom: { type: String, required: true, trim: true },

  // Prénom user
  prenom: { type: String, required: true, trim: true },

  // Adresse email (= identifiant)
  email: { type: String, required: true, unique: true, lowercase: true },

  // Mot de passe haché
  motDePasse: { type: String, required: true, minlength: 6 },

  // Rôle de l'utilisateur
  role: { 
    type: String, 
    enum: ['agriculteur', 'admin'], 
    default: 'agriculteur' 
  },

  // Localisation géographique du user
  localisation: {
    region: { type: String },    
    coordonnees: {
      lat: { type: Number }, 
      lng: { type: Number }    
    }
  },

  // Date d'inscription user
  dateCreation: { type: Date, default: Date.now },

  // Si le compte est actif
  actif: { type: Boolean, default: true }
});

// Chiffre le mot de passe uniquement s'il a été modifié

UserSchema.pre('save', async function (next) {
  // Si le mot de passe n'a pas changé
  if (!this.isModified('motDePasse')) return next();

  // Hachage du mot de passe 
  this.motDePasse = await bcrypt.hash(this.motDePasse, 12);
  next();
});

// Compare le mot de passe avec le hash stocké en BDD

UserSchema.methods.verifierMotDePasse = async function (motDePasse) {
  return await bcrypt.compare(motDePasse, this.motDePasse);
};

// Export du modèle pour utilisation sur routes d'auth
module.exports = mongoose.model('User', UserSchema);