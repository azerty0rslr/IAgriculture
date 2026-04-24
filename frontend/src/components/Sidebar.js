import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

const navItems = [
  { path: '/dashboard', label: 'Tableau de bord', icon: '📊' },
  { path: '/diagnostic', label: 'Diagnostic IA', icon: '🔬' },
  { path: '/parcelles', label: 'Mes Parcelles', icon: '🌾' },
  { path: '/carte', label: 'Carte interactive', icon: '🗺️' },
];

const adminItems = [
  { path: '/admin', label: 'Administration', icon: '⚙️' },
];

export default function Sidebar() {
  const { user, deconnecter } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const initiales = user ? `${user.prenom?.[0] || ''}${user.nom?.[0] || ''}`.toUpperCase() : '?';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>🌿 AgriIA</h2>
        <span>Chambre d'Agriculture</span>
      </div>

      <nav className="sidebar-nav">
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

        {user?.role === 'admin' && (
          <>
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '8px 0' }} />
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

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="avatar">{initiales}</div>
          <div className="user-info-text">
            <strong style={{ color: 'white' }}>{user?.prenom} {user?.nom}</strong>
            <span>{user?.role === 'admin' ? 'Administrateur' : 'Agriculteur'}</span>
          </div>
        </div>
        <button className="nav-item" onClick={deconnecter} style={{ color: 'rgba(255,100,100,0.8)', marginTop: '4px' }}>
          <span className="icon">🚪</span>
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}
