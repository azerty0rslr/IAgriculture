import React, { useState, useEffect } from 'react';
import { lancerDiagnostic, getDiagnostics, getParcelles } from '../services/api';

// Liste des symptômes
const SYMPTOMES = [
  { id: 'taches_jaunes',   label: 'Taches jaunes' },
  { id: 'taches_brunes',   label: 'Taches brunes' },
  { id: 'feuilles_seches', label: 'Feuilles sèches' },
  { id: 'moisissures',     label: 'Moisissures visibles' },
  { id: 'deformation',     label: 'Déformation des feuilles' },
  { id: 'chute_feuilles',  label: 'Chute prématurée' },
];

// Liste des cultures 
const CULTURES = ['Blé', 'Maïs', 'Tomate', 'Vigne', 'Tournesol', 'Colza', 'Orge', 'Pomme de terre'];

// Page de diagnostic IA; permet à l'agriculteur de passer les données de sa parcelle au diagnostic IA

export default function DiagnosticPage() {
  // Liste des parcelles 
  const [parcelles, setParcelles]   = useState([]);
  // Historique des diagnostics
  const [historique, setHistorique] = useState([]);
  // Résultat du dernier diagnostic
  const [resultat, setResultat]     = useState(null);
  // État de chargement
  const [chargement, setChargement] = useState(false);

  // Valeurs par défaut des capteurs simulés (pour le MVP sinon à remplacer par les données de l'IoT ou météo France)
  const [form, setForm] = useState({
    typeCulture: '',
    parcelleId:  '',
    donneesEntree: {
      temperature: 20, 
      humidite:    60, 
      ph:          7.0, 
      luminosite:  800, 
      symptomes:   [], 
    }
  });

  // Chargement des parcelles et de l'historique des diagnostics
  useEffect(() => {
    getParcelles().then(r => setParcelles(r.data.parcelles)).catch(() => {});
    getDiagnostics().then(r => setHistorique(r.data.diagnostics)).catch(() => {});
  }, []);

  // Ajoute ou retire un symptôme de la sélection au clic sur son bouton (Si déjà sélectionné il est retiré)
  const toggleSymptome = (id) => {
    const symp = form.donneesEntree.symptomes;
    setForm({
      ...form,
      donneesEntree: {
        ...form.donneesEntree,
        symptomes: symp.includes(id)
          ? symp.filter(s => s !== id) // Retire si déjà sélectionné
          : [...symp, id] // Ajout du symptôme sinon
      }
    });
  };

  // Les données des capteurs simulés sont converties en float
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (['temperature', 'humidite', 'ph', 'luminosite'].includes(name)) {
      // Conversion en float
      setForm({ ...form, donneesEntree: { ...form.donneesEntree, [name]: parseFloat(value) } });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // Envoie les données à l'API pour analyse IA puis MAJ l'historique
  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setChargement(true);
    setResultat(null); 
    try {
      const res = await lancerDiagnostic(form);
      setResultat(res.data.diagnostic); // Stockage le résultat
      // MAJ historique
      getDiagnostics().then(r => setHistorique(r.data.diagnostics)).catch(() => {});
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors du diagnostic');
    } finally {
      setChargement(false);
    }
  };

  // Colore la barre de progression au résultat
  const getProbaClass = (p) =>
    p >= 75 ? 'proba-critique' :
    p >= 50 ? 'proba-eleve'   :
    p >= 25 ? 'proba-moyen'   : 'proba-faible';

  return (
    <div>
      {/* En-tête */}
      <div className="page-header">
        <h1>Module Diagnostic IA</h1>
        <p>Soumettez les données de votre parcelle pour obtenir un diagnostic de maladie</p>
      </div>

      {/* Formulaire et résulats */}
      <div className="grid-2">

        {/* Carte du formulaire */}
        <div className="card">
          <h3 style={{ marginBottom: '20px', fontSize: '1rem' }}>Données de la parcelle</h3>
          <form onSubmit={handleSubmit}>

            {/* Type de culture et parcelles (optionnelle) */}
            <div className="grid-2">
              <div className="form-group">
                <label>Culture *</label>
                <select className="form-control" name="typeCulture" value={form.typeCulture} onChange={handleChange} required>
                  <option value="">Sélectionner</option>
                  {CULTURES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Parcelle (optionnel)</label>
                <select className="form-control" name="parcelleId" value={form.parcelleId} onChange={handleChange}>
                  <option value="">Aucune parcelle liée</option>
                  {parcelles.map(p => <option key={p._id} value={p._id}>{p.nom}</option>)}
                </select>
              </div>
            </div>

            {/* Sliders pour simuler les données capteurs (uniquement pour le MVP) */}
            <div style={{ background: '#f9f8f6', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: '600', color: '#4a6151', marginBottom: '12px' }}>Données capteurs</p>
              <div className="grid-2">
                {/* Sliders pour chaque paramètre */}
                {[
                  { name: 'temperature', label: 'Température (°C)', min: -10, max: 50,   step: 0.5 },
                  { name: 'humidite',    label: 'Humidité (%)',       min: 0,   max: 100,  step: 1   },
                  { name: 'ph',          label: 'pH du sol',          min: 3,   max: 10,   step: 0.1 },
                  { name: 'luminosite',  label: 'Luminosité (lux)',   min: 0,   max: 2000, step: 50  },
                ].map(({ name, label, min, max, step }) => (
                  <div className="form-group" key={name}>
                    {/* Affiche la valeur du sliders */}
                    <label>{label} : <strong>{form.donneesEntree[name]}</strong></label>
                    <input
                      type="range" name={name} min={min} max={max} step={step}
                      value={form.donneesEntree[name]} onChange={handleChange}
                      style={{ width: '100%', accentColor: '#3d7a52' }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Sélectionne des symptômes */}
            <div className="form-group">
              <label>Symptômes observés</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                {SYMPTOMES.map(s => (
                  <button
                    key={s.id} type="button"
                    onClick={() => toggleSymptome(s.id)}
                    style={{
                      padding: '6px 12px', borderRadius: '99px', border: '1.5px solid',
                      // Changement couleur balise si sélectionné
                      borderColor: form.donneesEntree.symptomes.includes(s.id) ? '#3d7a52' : '#e0ddd8',
                      background:  form.donneesEntree.symptomes.includes(s.id) ? '#e8f5ec' : 'white',
                      color:       form.donneesEntree.symptomes.includes(s.id) ? '#1a3a2a' : '#4a6151',
                      fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                      transition: 'all 0.15s'
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bouton de soumission */}
            <button
              type="submit" className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
              disabled={chargement}
            >
              {chargement ? 'Analyse en cours...' : 'Lancer le diagnostic IA'}
            </button>
          </form>
        </div>

        {/* Résultat diagnostic et historique */}
        <div>
          {resultat ? (
            // Résultat avec proba
            <div className="card" style={{ borderTop: `4px solid ${resultat.resultatIA.probabilite > 70 ? '#dc2626' : '#5a9e6e'}` }}>
              <h3 style={{ marginBottom: '16px', fontSize: '1rem' }}>Résultat du diagnostic</h3>

              {/* Nom de maladie et proba */}
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                {/* Icône dépend de la proba */}
                <div style={{ fontSize: '3rem', marginBottom: '8px' }}>
                  {resultat.resultatIA.probabilite > 75 ? '🔴' :
                   resultat.resultatIA.probabilite > 40 ? '🟡' : '🟢'}
                </div>
                {/* Nom de la maladie */}
                <h2 style={{ fontSize: '1.5rem', color: '#1a3a2a' }}>{resultat.resultatIA.maladie}</h2>

                {/* Probabilité en rouge si > 70%, sinon vert */}
                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: resultat.resultatIA.probabilite > 70 ? '#dc2626' : '#5a9e6e', marginTop: '8px' }}>
                  {resultat.resultatIA.probabilite}%
                </div>
                <div style={{ fontSize: '0.82rem', color: '#9ca3af' }}>Probabilité de maladie</div>

                {/* Barre de progression */}
                <div className="proba-bar" style={{ margin: '16px 0' }}>
                  <div
                    className={`proba-fill ${getProbaClass(resultat.resultatIA.probabilite)}`}
                    style={{ width: `${resultat.resultatIA.probabilite}%` }}
                  />
                </div>
                {/* Niveau de confiance du modèle */}
                <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                  Confiance du modèle : {resultat.resultatIA.confiance}%
                </div>
              </div>

              {/* Recommandations de l'IA */}
              <div style={{ background: '#f9f8f6', borderRadius: '12px', padding: '16px', marginTop: '16px' }}>
                <p style={{ fontSize: '0.82rem', fontWeight: '600', color: '#4a6151', marginBottom: '8px' }}>Recommandation</p>
                <p style={{ fontSize: '0.88rem', lineHeight: '1.6' }}>{resultat.resultatIA.recommandation}</p>
              </div>

              {/* Traitements proposés par l'IA (s'il y en a) */}
              {resultat.resultatIA.traitements?.length > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <p style={{ fontSize: '0.82rem', fontWeight: '600', color: '#4a6151', marginBottom: '8px' }}>Actions suggérées</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {resultat.resultatIA.traitements.map((t, i) => (
                      <span key={i} style={{ padding: '4px 12px', background: '#e8f5ec', color: '#1a3a2a', borderRadius: '99px', fontSize: '0.78rem' }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '48px 24px', border: '2px dashed #e0ddd8' }}>
              <div style={{ fontSize: '3rem' }}></div>
              <h3 style={{ marginTop: '12px', fontSize: '1.1rem', color: '#4a6151' }}>En attente d'analyse</h3>
              <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '8px' }}>
                Remplissez le formulaire et lancez le diagnostic pour obtenir les résultats IA
              </p>
            </div>
          )}

          {/* Historique 4 derniers diagnostics */}
          {historique.length > 0 && (
            <div className="card" style={{ marginTop: '20px' }}>
              <h3 style={{ marginBottom: '12px', fontSize: '0.95rem' }}>Historique récent</h3>
              {/* 4 diagnostics les plus récents */}
              {historique.slice(0, 4).map(d => (
                <div key={d._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f5f3f0' }}>
                  <div>
                    {/* Nom de la maladie */}
                    <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{d.resultatIA?.maladie}</span>
                    {/* Type de culture */}
                    <span style={{ fontSize: '0.75rem', color: '#9ca3af', marginLeft: '8px' }}>{d.typeCulture}</span>
                  </div>
                  {/* Probabilité */}
                  <span style={{ fontSize: '0.9rem', fontWeight: '600', color: d.resultatIA?.probabilite > 70 ? '#dc2626' : '#5a9e6e' }}>
                    {d.resultatIA?.probabilite}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}