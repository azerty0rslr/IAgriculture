const express = require('express');
const router = express.Router();
const OpenAI = require('openai');     
const Diagnostic = require('../models/Diagnostic'); 
const { proteger } = require('../middleware/auth'); 

// OpenAI initialisé avec la clé API (.env)
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Construit un prompt et retourne un JSON
const analyserAvecIA = async (donnees) => {
    const { temperature, humidite, ph, luminosite, symptomes, typeCulture } = donnees;

    // Symptomes sécurisés pour éviter les injections dans le prompt
    const symptomesSafe = Array.isArray(symptomes)
        ? symptomes.map(s => String(s).replace(/"/g, "'"))
        : [];

    // Prompt envoyé à l'IA avec les données capteurs (simulés) et les symptômes - réponse en JSON 
    const prompt = `Tu es un expert agronome spécialisé dans les maladies des cultures agricoles.

Voici les données d'une parcelle de ${typeCulture} :
- Température : ${temperature}°C
- Humidité : ${humidite}%
- pH du sol : ${ph}
- Luminosité : ${luminosite} lux
- Symptômes observés : ${symptomesSafe.length > 0 ? symptomesSafe.join(', ') : 'aucun symptôme particulier'}

Analyse ces données et réponds UNIQUEMENT en JSON valide avec cette structure exacte :
{
  "maladie": "nom de la maladie détectée ou Aucune maladie détectée",
  "probabilite": nombre entre 0 et 100,
  "confiance": nombre entre 0 et 100,
  "recommandation": "recommandation détaillée en français",
  "traitements": ["traitement 1", "traitement 2", "traitement 3"]
}`;

    // Appel à l'API OpenAI 
    const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini', 
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,  
        max_tokens: 500,   
    });

    // Vérifie que l'API a répondu
    if (!response.choices || response.choices.length === 0) {
        throw new Error('Réponse OpenAI vide');
    }

    // Contenu de la réponse
    const contenu = response.choices[0].message?.content?.trim();

    if (!contenu) {
        throw new Error('Contenu IA vide');
    }

    // Nettoie le JSON de réponse
    const jsonPropre = contenu.replace(/```json|```/g, '').trim();

    // JSON retourné par l'IA (avec une gestion des erreurs)
    let resultat;
    try {
        resultat = JSON.parse(jsonPropre);
    } catch (err) {
        console.error('Erreur parsing JSON IA:', err.message);
        throw new Error('Réponse IA invalide');
    }

    return resultat;
};

/**
 * POST /api/diagnostics
 * Lance un nouveau diagnostic IA avec les données capteurs et les symptômes observés
 */
router.post('/', proteger, async (req, res) => {
    try {
        const { typeCulture, parcelleId, donneesEntree } = req.body;

        // Vérifie les champs obligatoires
        if (!typeCulture) {
            return res.status(400).json({ message: 'Le type de culture est requis.' });
        }

        if (!donneesEntree) {
            return res.status(400).json({ message: "Les données d'entrée sont requises." });
        }

        // Appel à la fonction l'analyse via l'IA
        const resultatIA = await analyserAvecIA({ ...donneesEntree, typeCulture });

        // Sauvegarde diagnostic et résultat IA en BDD
        const diagnostic = await Diagnostic.create({
            userId: req.user._id,
            parcelleId: parcelleId || null, 
            typeCulture,
            donneesEntree,
            resultatIA,
            statut: 'traite'
        });

        res.status(201).json({ message: 'Diagnostic effectué.', diagnostic });

    } catch (err) {
        console.error('Erreur diagnostic IA:', err);

        // Si l'API OpenAI est down
        const fallback = {
            maladie: 'Analyse indisponible',
            probabilite: 0,
            confiance: 0,
            recommandation: 'Le service IA est temporairement indisponible. Consultez un agronome.',
            traitements: ['Consultation agronome recommandée']
        };

        try {
            const { typeCulture, parcelleId, donneesEntree } = req.body;

            // Sauvegarde du diagnostic avec le résultat (secours)
            const diagnostic = await Diagnostic.create({
                userId: req.user._id,
                parcelleId: parcelleId || null,
                typeCulture: typeCulture || 'inconnu',
                donneesEntree: donneesEntree || {},
                resultatIA: fallback,
                statut: 'erreur'
            });

            return res.status(500).json({
                message: 'Erreur lors du diagnostic IA.',
                erreur: err.message,
                diagnosticFallback: diagnostic
            });

        } catch (dbErr) {
            // Erreur critique si même le fallback ne fonctionne pas
            console.error('Erreur sauvegarde fallback:', dbErr);
            return res.status(500).json({
                message: 'Erreur critique serveur.',
                erreur: err.message
            });
        }
    }
});

/**
 * GET /api/diagnostics
 * Retourne l'historique des 20 derniers diagnostics du user
 */
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

/**
 * GET /api/diagnostics/:id
 * Retourne le détail d'un diagnostic
 */
router.get('/:id', proteger, async (req, res) => {
    try {
        const diagnostic = await Diagnostic.findOne({
            _id: req.params.id,
            userId: req.user._id
        }).populate('parcelleId', 'nom culture coordonnees'); 

        // Si aucun diagnostic ne correspond -> erreur
        if (!diagnostic) {
            return res.status(404).json({ message: 'Diagnostic introuvable.' });
        }

        res.json({ diagnostic });

    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur.', erreur: err.message });
    }
});

// Export du routeur pour intégration sur serveur principal
module.exports = router;