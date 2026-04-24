import React, { useState, useEffect } from 'react';
import { getUsers, getAdminStats, toggleUserActif, supprimerUser } from '../services/api';

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [chargement, setChargement] = useState(true);

  const charger = () => {
    Promise.all([getUsers(), getAdminStats()])
      .then(([u, s]) => { setUsers(u.data.users); setStats(s.data); })
      .finally(() => setChargement(false));
  };

  useEffect(() => { charger(); }, []);

  const handleToggle = async (id, actuel) => {
    await toggleUserActif(id, !actuel);
    charger();
  };

  const handleSupprimer = async (id) => {
    if (!window.confirm('Supprimer cet utilisateur et toutes ses données ?')) return;
    await supprimerUser(id);
    charger();
  };

  return (
    <div>
      <div className="page-header">
        <h1>⚙️ Administration</h1>
        <p>Gestion des utilisateurs et supervision du système</p>
      </div>

      {/* Stats admin */}
      {stats && (
        <div className="grid-3" style={{ marginBottom: '24px' }}>
          <div className="stat-card vert">
            <div className="stat-value">{stats.totalUsers}</div>
            <div className="stat-label">Utilisateurs inscrits</div>
          </div>
          <div className="stat-card soleil">
            <div className="stat-value">{stats.totalDiagnostics}</div>
            <div className="stat-label">Diagnostics IA réalisés</div>
          </div>
          <div className="stat-card terre">
            <div className="stat-value">{stats.totalParcelles}</div>
            <div className="stat-label">Parcelles enregistrées</div>
          </div>
        </div>
      )}

      {/* Table utilisateurs */}
      <div className="card">
        <h3 style={{ marginBottom: '16px', fontSize: '1rem' }}>👥 Gestion des utilisateurs</h3>
        {chargement ? (
          <div className="loader">⏳ Chargement...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Région</th>
                  <th>Statut</th>
                  <th>Inscription</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '50%',
                          background: '#e8f5ec', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontSize: '0.8rem', fontWeight: '600', color: '#1a3a2a'
                        }}>
                          {(u.prenom?.[0] || '') + (u.nom?.[0] || '')}
                        </div>
                        <span style={{ fontWeight: '500' }}>{u.prenom} {u.nom}</span>
                      </div>
                    </td>
                    <td style={{ color: '#4a6151' }}>{u.email}</td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'badge-critique' : 'badge-faible'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ color: '#9ca3af', fontSize: '0.82rem' }}>{u.localisation?.region || '—'}</td>
                    <td>
                      <span className={`badge ${u.actif ? 'badge-faible' : 'badge-critique'}`}>
                        {u.actif ? '✓ Actif' : '✗ Désactivé'}
                      </span>
                    </td>
                    <td style={{ color: '#9ca3af', fontSize: '0.82rem' }}>
                      {new Date(u.dateCreation).toLocaleDateString('fr-FR')}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className={`btn btn-sm ${u.actif ? 'btn-secondary' : 'btn-primary'}`}
                          onClick={() => handleToggle(u._id, u.actif)}
                        >
                          {u.actif ? '🔒 Désactiver' : '🔓 Activer'}
                        </button>
                        {u.role !== 'admin' && (
                          <button className="btn btn-danger btn-sm" onClick={() => handleSupprimer(u._id)}>
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {users.length === 0 && (
              <div style={{ textAlign: 'center', padding: '32px', color: '#9ca3af' }}>
                Aucun utilisateur enregistré.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
