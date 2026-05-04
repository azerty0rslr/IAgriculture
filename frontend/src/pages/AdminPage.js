import React, { useState, useEffect } from 'react';
import { getUsers, getAdminStats, toggleUserActif, supprimerUser } from '../services/api';

// Affiche les stats globales et gestion des utilisateurs
export default function AdminPage() {
  // Liste des users
  const [users, setUsers]       = useState([]);
  const [stats, setStats]       = useState(null); // (total users, diagnostics, parcelles)
  const [chargement, setChargement] = useState(true);

  // Récupère la liste des users et les statistiques globales
  const charger = () => {
    Promise.all([getUsers(), getAdminStats()])
      .then(([u, s]) => {
        setUsers(u.data.users);
        setStats(s.data);  
      })
      .finally(() => setChargement(false)); 
  };

  // Chargement des données
  useEffect(() => { charger(); }, []);

  // Recharge la liste après la MAJ
  const handleToggle = async (id, actuel) => {
    await toggleUserActif(id, !actuel); 
    charger(); 
  };

  // Supprime un user et toutes ses données
  const handleSupprimer = async (id) => {
    if (!window.confirm('Supprimer cet utilisateur et toutes ses données ?')) return;
    await supprimerUser(id); 
    charger();    
  };

  return (
    <div>
      {/* En-tête */}
      <div className="page-header">
        <h1>Administration</h1>
        <p>Gestion des utilisateurs et supervision du système</p>
      </div>

      {/* Statistiques globales */}
      {stats && (
        <div className="grid-3" style={{ marginBottom: '24px' }}>
          {/* Nbr total users */}
          <div className="stat-card vert">
            <div className="stat-value">{stats.totalUsers}</div>
            <div className="stat-label">Utilisateurs inscrits</div>
          </div>
          {/* Nbr total de diagnostics IA */}
          <div className="stat-card soleil">
            <div className="stat-value">{stats.totalDiagnostics}</div>
            <div className="stat-label">Diagnostics IA réalisés</div>
          </div>
          {/* Nbr total de parcelles */}
          <div className="stat-card terre">
            <div className="stat-value">{stats.totalParcelles}</div>
            <div className="stat-label">Parcelles enregistrées</div>
          </div>
        </div>
      )}

      {/* Gestion des users */}
      <div className="card">
        <h3 style={{ marginBottom: '16px', fontSize: '1rem' }}>Gestion des utilisateurs</h3>

        {/* Chargement ou tableau des users */}
        {chargement ? (
          <div className="loader">Chargement...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}> {/* Responsive */}
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

                    {/* Colonne nom */}
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

                    {/* Email */}
                    <td style={{ color: '#4a6151' }}>{u.email}</td>

                    {/* Rôles : rouge - admin, vert - agriculteur */}
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'badge-critique' : 'badge-faible'}`}>
                        {u.role}
                      </span>
                    </td>

                    {/* Région (page inscription) */}
                    <td style={{ color: '#9ca3af', fontSize: '0.82rem' }}>
                      {u.localisation?.region || '—'}
                    </td>

                    {/* Statut : vert - actif, rouge - désactivé */}
                    <td>
                      <span className={`badge ${u.actif ? 'badge-faible' : 'badge-critique'}`}>
                        {u.actif ? '✓ Actif' : '✗ Désactivé'}
                      </span>
                    </td>

                    {/* Date d'inscription */}
                    <td style={{ color: '#9ca3af', fontSize: '0.82rem' }}>
                      {new Date(u.dateCreation).toLocaleDateString('fr-FR')}
                    </td>

                    {/* Actions : activation/désactivation et suppression de user */}
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {/* Bouton actif/inacrif */}
                        <button
                          className={`btn btn-sm ${u.actif ? 'btn-secondary' : 'btn-primary'}`}
                          onClick={() => handleToggle(u._id, u.actif)}
                        >
                          {u.actif ? 'Désactiver' : 'Activer'}
                        </button>

                        {/* Bouton de suppression (sauf admin) */}
                        {u.role !== 'admin' && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleSupprimer(u._id)}
                          >
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* SI aucun users */}
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