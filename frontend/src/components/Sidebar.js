import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; 
import { useAuth } from '../services/AuthContext';

// Titres des pages
const navItems = [
  { path: '/dashboard', label: 'Tableau de bord' },
  { path: '/diagnostic', label: 'Diagnostic IA' },
  { path: '/parcelles',  label: 'Mes Parcelles' },
  { path: '/carte',      label: 'Carte interactive' },
];

// Administrateur
const adminItems = [
  { path: '/admin', label: 'Administration' },
];

/**
 * Barre de navigation
 * Administration visible uniquement pour les admins
 */
export default function Sidebar() {
  const { user, deconnecter } = useAuth(); 
  const navigate = useNavigate();  
  const { pathname } = useLocation();  

  // Génère initiales du user
  const initiales = user
    ? `${user.prenom?.[0] || ''}${user.nom?.[0] || ''}`.toUpperCase()
    : '?';

  return (
    <aside className="sidebar">

      {/* En-tête de la barre de navigation */}
      <div className="sidebar-logo">
        <h2>AgriIA</h2>
        <span>Chambre d'Agriculture</span>
      </div>

      {/* Menu de navigation */}
      <nav className="sidebar-nav">

        {/* Boutons de navigation à partir de navItems */}
        {navItems.map((item) => (
          <button
            key={item.path}
            className={`nav-item ${pathname === item.path ? 'actif' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="icon">{item.icon}</span>
            {item.label}
          </button>
        ))}

        {/* Section Administration - si user est admiin */}
        {user?.role === 'admin' && (
          <>
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '8px 0' }} />

            {/* Boutons pour l'admin */}
            {adminItems.map((item) => (
              <button
                key={item.path}
                className={`nav-item ${pathname === item.path ? 'actif' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <span className="icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </>
        )}
      </nav>

      {/* Footer de la barre de navigation */}
      <div className="sidebar-footer">
        <div className="user-info">
          <div className="avatar">{initiales}</div>
          <div className="user-info-text">
            <strong style={{ color: 'white' }}>{user?.prenom} {user?.nom}</strong>
            <span>{user?.role === 'admin' ? 'Administrateur' : 'Agriculteur'}</span>
          </div>
        </div>

        {/* Bouton de déconnexion */}
        <button
          className="nav-item"
          onClick={deconnecter}
          style={{ color: 'rgba(255,100,100,0.8)', marginTop: '4px' }}
        >
          <span className="icon">🚪</span>
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}