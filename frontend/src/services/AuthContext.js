import React, { createContext, useContext, useState, useEffect } from 'react';
import { connexion as apiConnexion, inscription as apiInscription } from '../services/api';
// Non connecté par défaut
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restaure la session si elle avait bien un token sinon en créer une
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStocke = localStorage.getItem('user');
    if (token && userStocke) {
      setUser(JSON.parse(userStocke));
    }
    setLoading(false);
  }, []);

  // Appelle API connexion, stocke le token et le user (local)
  const connecter = async (email, motDePasse) => {
    const { data } = await apiConnexion({ email, motDePasse });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  // Idem mais inscription
  const inscrire = async (formData) => {
    const { data } = await apiInscription(formData);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  // Déconnexion, supprime les données en local
  const deconnecter = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // User, loading et authentification
  return (
    <AuthContext.Provider value={{ user, loading, connecter, inscrire, deconnecter }}>
      {children}
    </AuthContext.Provider>
  );
};

// Erreur si en dehors d'un AuthProvider (authentification sécurisée)
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider');
  return ctx;
};