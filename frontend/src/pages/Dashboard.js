import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getDashboard } from '../services/api'; 
import { useAuth } from '../services/AuthContext'; 

// Niveaux de risque pour le graphique 
const COULEURS_RISQUE = ['#5a9e6e', '#f0b429', '#d97706', '#dc2626'];

// Affiche les statistiques, les diagnostics, les risques et alertes
export default function Dashboard() {
  // Data du tableau de bord 
  const [data, setData] = useState(null);
  const [chargement, setChargement] = useState(true);
  const { user } = useAuth();  
  const navigate = useNavigate(); 

  // Data du tableau de bord
  useEffect(() => {
    getDashboard()
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setChargement(false));
  }, []);

  // Affiche un chargement
  if (chargement) return <div className="loader">Chargement du tableau de bord...</div>;

  // Déstructuration des données (pour JSX)
  const { stats, diagnosticsRecents, alertes } = data || {};

  // Données pour le graphique filtré par répartition des risques
  const dataRisque = [
    { name: 'Faible', value: stats?.parcellesParRisque?.faible || 0 },
    { name: 'Moyen', value: stats?.parcellesParRisque?.moyen || 0 },
    { name: 'Élevé', value: stats?.parcellesParRisque?.eleve || 0 },
    { name: 'Critique', value: stats?.parcellesParRisque?.critique || 0 },
  ].filter(d => d.value > 0);

  return (
    <div>
      {/* En-tête avec le prénom user et diagnostic */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Bonjour, {user?.prenom}</h1>
          <p>Voici l'état de vos parcelles aujourd'hui</p>
        </div>
        {/* Bouton vers la page de diagnostic */}
        <button className="btn btn-primary" onClick={() => navigate('/diagnostic')}>
          Nouveau diagnostic
        </button>
      </div>

      {/* 4 statistiques pour l'agriculteur */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        {/* Nbr total de parcelles */}
        <div className="stat-card vert">
          <div className="stat-value">{stats?.totalParcelles ?? 0}</div>
          <div className="stat-label">Parcelles suivies</div>
        </div>
        {/* Surface totale arrondie */}
        <div className="stat-card terre">
          <div className="stat-value">{stats?.totalSurface?.toFixed(1) ?? 0} ha</div>
          <div className="stat-label">Surface totale</div>
        </div>
        {/* Nbr total de diagnostics */}
        <div className="stat-card soleil">
          <div className="stat-value">{stats?.totalDiagnostics ?? 0}</div>
          <div className="stat-label">Diagnostics IA effectués</div>
        </div>
        {/* Nbr d'alertes */}
        <div className="stat-card danger">
          <div className="stat-value">{stats?.alertesNonLues ?? 0}</div>
          <div className="stat-label">Alertes non lues</div>
        </div>
      </div>

      {/* Graphique de risques */}
      <div className="grid-2" style={{ marginBottom: '24px' }}>

        {/* Carte des 5 derniers diagnostics */}
        <div className="card">
          <h3 style={{ marginBottom: '16px', fontSize: '1rem' }}>Diagnostics récents</h3>

          {/* Si aucun diagnostic n'a encore été effectué */}
          {diagnosticsRecents?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: '#9ca3af' }}>
              <div style={{ fontSize: '2rem' }}></div>
              <p style={{ marginTop: '8px', fontSize: '0.85rem' }}>Aucun diagnostic pour l'instant</p>
              <button className="btn btn-primary btn-sm" style={{ marginTop: '12px' }} onClick={() => navigate('/diagnostic')}>
                Lancer mon premier diagnostic
              </button>
            </div>
          ) : (
            // Liste des diagnostics récents 
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {diagnosticsRecents?.map((d) => (
                <div key={d._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f9f8f6', borderRadius: '10px' }}>
                  <div>
                    {/* Nom de la maladie donnée par IA */}
                    <strong style={{ fontSize: '0.88rem' }}>{d.resultatIA?.maladie || 'Analyse...'}</strong>
                    {/* Type culture et nom de la parcelle */}
                    <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '2px' }}>
                      {d.typeCulture} · {d.parcelleId?.nom || 'Parcelle inconnue'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {/* Proba en rouge si > 70%, vert sinon */}
                    <div style={{ fontSize: '1.1rem', fontWeight: '600', color: d.resultatIA?.probabilite > 70 ? '#dc2626' : '#5a9e6e' }}>
                      {d.resultatIA?.probabilite}%
                    </div>
                    {/* Date du diagnostic */}
                    <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
                      {new Date(d.dateCreation).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Carte du graphique réparti avec les risques par parcelle */}
        <div className="card">
          <h3 style={{ marginBottom: '16px', fontSize: '1rem' }}>Répartition des risques</h3>

          {/* Vide si aucune parcelle */}
          {dataRisque.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: '#9ca3af' }}>
              <div style={{ fontSize: '2rem' }}></div>
              <p style={{ marginTop: '8px', fontSize: '0.85rem' }}>Ajoutez des parcelles pour voir les statistiques</p>
              <button className="btn btn-primary btn-sm" style={{ marginTop: '12px' }} onClick={() => navigate('/parcelles')}>
                Ajouter une parcelle
              </button>
            </div>
          ) : (
            // Donut avec niveau de risque
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={dataRisque}
                  cx="50%" cy="50%"
                  innerRadius={55}  
                  outerRadius={80}  
                  paddingAngle={3}   
                  dataKey="value"
                  // Étiquette (nom, nbr parcelles, risque)
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {/* Couleur des sections */}
                  {dataRisque.map((_, i) => <Cell key={i} fill={COULEURS_RISQUE[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Alertes IA non lues */}
      {alertes?.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: '16px', fontSize: '1rem' }}>Alertes récentes</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {alertes.map((a, i) => (
              // Couleur de fond adaptée au type d'alerte : rouge, jaune ou vert
              <div key={i} style={{
                display: 'flex', gap: '12px', alignItems: 'center',
                padding: '12px 16px', borderRadius: '10px',
                background: a.type === 'danger'  ? '#fee2e2' :
                            a.type === 'warning' ? '#fef3c7' : '#e8f5ec'
              }}>
                {/* Icône colorée selon le niveau de gravité de l'alerte */}
                <span>{a.type === 'danger' ? '🔴' : a.type === 'warning' ? '🟡' : 'ℹ️'}</span>
                <div>
                  {/* Nom de la parcelle concernée par l'alerte */}
                  <strong style={{ fontSize: '0.88rem' }}>{a.parcelle}</strong>
                  {/* Message détaillé de l'alerte */}
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