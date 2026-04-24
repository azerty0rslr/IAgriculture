import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

export default function LoginPage() {
  const [mode, setMode] = useState('connexion'); // 'connexion' | 'inscription'
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', motDePasse: '', region: '' });
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);
  const { connecter, inscrire } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');
    setChargement(true);
    try {
      if (mode === 'connexion') {
        await connecter(form.email, form.motDePasse);
      } else {
        await inscrire(form);
      }
      navigate('/dashboard');
    } catch (err) {
      setErreur(err.response?.data?.message || 'Une erreur est survenue.');
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🌿</div>
          <h1>AgriIA</h1>
          <p>Chambre d'Agriculture — Outil de diagnostic intelligent</p>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: '#f0ede8', borderRadius: '10px', padding: '4px' }}>
          {['connexion', 'inscription'].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                flex: 1, padding: '8px', border: 'none', borderRadius: '8px', cursor: 'pointer',
                background: mode === m ? 'white' : 'transparent',
                fontWeight: mode === m ? '600' : '400',
                color: mode === m ? '#1a3a2a' : '#4a6151',
                boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.88rem', transition: 'all 0.15s'
              }}
            >
              {m === 'connexion' ? 'Se connecter' : 'S\'inscrire'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'inscription' && (
            <>
              <div className="grid-2">
                <div className="form-group">
                  <label>Prénom</label>
                  <input className="form-control" name="prenom" value={form.prenom} onChange={handleChange} required placeholder="Jean" />
                </div>
                <div className="form-group">
                  <label>Nom</label>
                  <input className="form-control" name="nom" value={form.nom} onChange={handleChange} required placeholder="Dupont" />
                </div>
              </div>
              <div className="form-group">
                <label>Région</label>
                <select className="form-control" name="region" value={form.region} onChange={handleChange}>
                  <option value="">Sélectionner une région</option>
                  {['Île-de-France','Normandie','Bretagne','Pays de la Loire','Occitanie','Provence-Alpes-Côte d\'Azur','Auvergne-Rhône-Alpes','Nouvelle-Aquitaine','Grand Est','Hauts-de-France','Bourgogne-Franche-Comté','Centre-Val de Loire'].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="form-group">
            <label>Email</label>
            <input className="form-control" type="email" name="email" value={form.email} onChange={handleChange} required placeholder="jean.dupont@email.fr" />
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <input className="form-control" type="password" name="motDePasse" value={form.motDePasse} onChange={handleChange} required placeholder="••••••••" />
          </div>

          {erreur && (
            <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px' }}>
              {erreur}
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }} disabled={chargement}>
            {chargement ? '⏳ Chargement...' : mode === 'connexion' ? '🔐 Se connecter' : '✅ Créer mon compte'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.78rem', color: '#9ca3af', marginTop: '20px' }}>
          Projet Bachelor 2 — Sup de Vinci × Chambre d'Agriculture
        </p>
      </div>
    </div>
  );
}
