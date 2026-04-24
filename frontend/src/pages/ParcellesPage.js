import React, { useState, useEffect } from 'react';
import { getParcelles, creerParcelle, supprimerParcelle, mettreAJourCapteurs } from '../services/api';

const CULTURES = ['Blé', 'Maïs', 'Tomate', 'Vigne', 'Tournesol', 'Colza', 'Orge', 'Pomme de terre'];

const defaultForm = {
  nom: '', culture: '', surface: '',
  coordonnees: { lat: 46.8, lng: 2.3 }
};

export default function ParcellesPage() {
  const [parcelles, setParcelles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [chargement, setChargement] = useState(true);
  const [simulCapt, setSimulCapt] = useState(null); // id parcelle pour simulation

  const charger = () => {
    getParcelles().then(r => setParcelles(r.data.parcelles)).finally(() => setChargement(false));
  };

  useEffect(() => { charger(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await creerParcelle({ ...form, surface: parseFloat(form.surface) });
      setForm(defaultForm);
      setShowForm(false);
      charger();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    }
  };

  const handleSupprimer = async (id) => {
    if (!window.confirm('Supprimer cette parcelle ?')) return;
    await supprimerParcelle(id);
    charger();
  };

  const handleSimulCapt = async (id) => {
    const donnees = {
      temperature: Math.round(15 + Math.random() * 20),
      humidite: Math.round(40 + Math.random() * 50),
      ph: +(5.5 + Math.random() * 2.5).toFixed(1),
      luminosite: Math.round(400 + Math.random() * 1200)
    };
    await mettreAJourCapteurs(id, donnees);
    setSimulCapt(null);
    charger();
  };

  const badgeRisque = (r) => <span className={`badge badge-${r}`}>{r}</span>;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>🌾 Mes Parcelles</h1>
          <p>Gérez et surveillez toutes vos parcelles agricoles</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Annuler' : '+ Nouvelle parcelle'}
        </button>
      </div>

      {/* Formulaire création */}
      {showForm && (
        <div className="card" style={{ marginBottom: '24px', borderTop: '3px solid #3d7a52' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '1rem' }}>Ajouter une parcelle</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid-3">
              <div className="form-group">
                <label>Nom de la parcelle *</label>
                <input className="form-control" value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} required placeholder="Parcelle Nord" />
              </div>
              <div className="form-group">
                <label>Culture *</label>
                <select className="form-control" value={form.culture} onChange={e => setForm({...form, culture: e.target.value})} required>
                  <option value="">Sélectionner</option>
                  {CULTURES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Surface (hectares) *</label>
                <input className="form-control" type="number" min="0.1" step="0.1" value={form.surface} onChange={e => setForm({...form, surface: e.target.value})} required placeholder="5.2" />
              </div>
              <div className="form-group">
                <label>Latitude</label>
                <input className="form-control" type="number" step="0.0001" value={form.coordonnees.lat} onChange={e => setForm({...form, coordonnees: {...form.coordonnees, lat: parseFloat(e.target.value)}})} />
              </div>
              <div className="form-group">
                <label>Longitude</label>
                <input className="form-control" type="number" step="0.0001" value={form.coordonnees.lng} onChange={e => setForm({...form, coordonnees: {...form.coordonnees, lng: parseFloat(e.target.value)}})} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">✅ Créer la parcelle</button>
          </form>
        </div>
      )}

      {/* Liste */}
      {chargement ? (
        <div className="loader">⏳ Chargement...</div>
      ) : parcelles.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px', border: '2px dashed #e0ddd8' }}>
          <div style={{ fontSize: '3rem' }}>🌱</div>
          <h3 style={{ marginTop: '12px', color: '#4a6151' }}>Aucune parcelle</h3>
          <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '6px' }}>Ajoutez votre première parcelle pour commencer le suivi</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {parcelles.map(p => (
            <div key={p._id} className="card" style={{ borderLeft: `4px solid ${p.niveauRisque === 'critique' ? '#dc2626' : p.niveauRisque === 'eleve' ? '#d97706' : p.niveauRisque === 'moyen' ? '#f0b429' : '#5a9e6e'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '1.05rem' }}>{p.nom}</h3>
                    {badgeRisque(p.niveauRisque)}
                  </div>
                  <div style={{ display: 'flex', gap: '20px', fontSize: '0.85rem', color: '#4a6151', flexWrap: 'wrap' }}>
                    <span>🌱 {p.culture}</span>
                    <span>📐 {p.surface} ha</span>
                    <span>📍 {p.coordonnees?.lat?.toFixed(3)}, {p.coordonnees?.lng?.toFixed(3)}</span>
                  </div>

                  {p.donneesCapeurs && (
                    <div style={{ display: 'flex', gap: '16px', marginTop: '12px', background: '#f9f8f6', padding: '10px 14px', borderRadius: '10px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.8rem' }}>🌡️ <strong>{p.donneesCapeurs.temperature}°C</strong></span>
                      <span style={{ fontSize: '0.8rem' }}>💧 <strong>{p.donneesCapeurs.humidite}%</strong></span>
                      <span style={{ fontSize: '0.8rem' }}>⚗️ pH <strong>{p.donneesCapeurs.ph}</strong></span>
                      <span style={{ fontSize: '0.8rem' }}>☀️ <strong>{p.donneesCapeurs.luminosite} lux</strong></span>
                      <span style={{ fontSize: '0.72rem', color: '#9ca3af', marginLeft: 'auto' }}>
                        Mis à jour : {p.donneesCapeurs.derniereMiseAJour ? new Date(p.donneesCapeurs.derniereMiseAJour).toLocaleString('fr-FR') : 'Jamais'}
                      </span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleSimulCapt(p._id)}
                    title="Simuler une lecture capteur"
                  >
                    📡 Capteurs
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleSupprimer(p._id)}>🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
