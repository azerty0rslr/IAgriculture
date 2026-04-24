import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getDashboard } from '../services/api';
import { useAuth } from '../services/AuthContext';

const COULEURS_RISQUE = ['#5a9e6e', '#f0b429', '#d97706', '#dc2626'];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [chargement, setChargement] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getDashboard()
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setChargement(false));
  }, []);

  if (chargement) return <div className="loader">⏳ Chargement du tableau de bord...</div>;

  const { stats, diagnosticsRecents, alertes } = data || {};

  const dataRisque = [
    { name: 'Faible', value: stats?.parcellesParRisque?.faible || 0 },
    { name: 'Moyen', value: stats?.parcellesParRisque?.moyen || 0 },
    { name: 'Élevé', value: stats?.parcellesParRisque?.eleve || 0 },
    { name: 'Critique', value: stats?.parcellesParRisque?.critique || 0 },
  ].filter(d => d.value > 0);

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Bonjour, {user?.prenom} 👋</h1>
          <p>Voici l'état de vos parcelles aujourd'hui</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/diagnostic')}>
          🔬 Nouveau diagnostic
        </button>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <div className="stat-card vert">
          <div className="stat-value">{stats?.totalParcelles ?? 0}</div>
          <div className="stat-label">Parcelles suivies</div>
        </div>
        <div className="stat-card terre">
          <div className="stat-value">{stats?.totalSurface?.toFixed(1) ?? 0} ha</div>
          <div className="stat-label">Surface totale</div>
        </div>
        <div className="stat-card soleil">
          <div className="stat-value">{stats?.totalDiagnostics ?? 0}</div>
          <div className="stat-label">Diagnostics IA effectués</div>
        </div>
        <div className="stat-card danger">
          <div className="stat-value">{stats?.alertesNonLues ?? 0}</div>
          <div className="stat-label">Alertes non lues</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: '24px' }}>
        {/* Diagnostics récents */}
        <div className="card">
          <h3 style={{ marginBottom: '16px', fontSize: '1rem' }}>📋 Diagnostics récents</h3>
          {diagnosticsRecents?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: '#9ca3af' }}>
              <div style={{ fontSize: '2rem' }}>🔬</div>
              <p style={{ marginTop: '8px', fontSize: '0.85rem' }}>Aucun diagnostic pour l'instant</p>
              <button className="btn btn-primary btn-sm" style={{ marginTop: '12px' }} onClick={() => navigate('/diagnostic')}>
                Lancer mon premier diagnostic
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {diagnosticsRecents?.map((d) => (
                <div key={d._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f9f8f6', borderRadius: '10px' }}>
                  <div>
                    <strong style={{ fontSize: '0.88rem' }}>{d.resultatIA?.maladie || 'Analyse...'}</strong>
                    <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '2px' }}>
                      {d.typeCulture} · {d.parcelleId?.nom || 'Parcelle inconnue'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: '600', color: d.resultatIA?.probabilite > 70 ? '#dc2626' : '#5a9e6e' }}>
                      {d.resultatIA?.probabilite}%
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
                      {new Date(d.dateCreation).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Graphique risques */}
        <div className="card">
          <h3 style={{ marginBottom: '16px', fontSize: '1rem' }}>🎯 Répartition des risques</h3>
          {dataRisque.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: '#9ca3af' }}>
              <div style={{ fontSize: '2rem' }}>🌾</div>
              <p style={{ marginTop: '8px', fontSize: '0.85rem' }}>Ajoutez des parcelles pour voir les statistiques</p>
              <button className="btn btn-primary btn-sm" style={{ marginTop: '12px' }} onClick={() => navigate('/parcelles')}>
                Ajouter une parcelle
              </button>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={dataRisque} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {dataRisque.map((_, i) => <Cell key={i} fill={COULEURS_RISQUE[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Alertes */}
      {alertes?.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: '16px', fontSize: '1rem' }}>⚠️ Alertes récentes</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {alertes.map((a, i) => (
              <div key={i} style={{
                display: 'flex', gap: '12px', alignItems: 'center',
                padding: '12px 16px', borderRadius: '10px',
                background: a.type === 'danger' ? '#fee2e2' : a.type === 'warning' ? '#fef3c7' : '#e8f5ec'
              }}>
                <span>{a.type === 'danger' ? '🔴' : a.type === 'warning' ? '🟡' : 'ℹ️'}</span>
                <div>
                  <strong style={{ fontSize: '0.88rem' }}>{a.parcelle}</strong>
                  <p style={{ fontSize: '0.82rem', color: '#4a6151', marginTop: '2px' }}>{a.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
