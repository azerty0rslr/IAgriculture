import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
});

// Injecte le token JWT dans chaque requête
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirige vers /login si token expiré
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── AUTH ───────────────────────────────────────────────
export const inscription = (data) => API.post('/auth/inscription', data);
export const connexion = (data) => API.post('/auth/connexion', data);
export const getMoi = () => API.get('/auth/moi');

// ─── DASHBOARD ──────────────────────────────────────────
export const getDashboard = () => API.get('/dashboard');

// ─── PARCELLES ──────────────────────────────────────────
export const getParcelles = () => API.get('/parcelles');
export const creerParcelle = (data) => API.post('/parcelles', data);
export const mettreAJourParcelle = (id, data) => API.put(`/parcelles/${id}`, data);
export const supprimerParcelle = (id) => API.delete(`/parcelles/${id}`);
export const mettreAJourCapteurs = (id, data) => API.post(`/parcelles/${id}/capteurs`, data);

// ─── DIAGNOSTICS ────────────────────────────────────────
export const lancerDiagnostic = (data) => API.post('/diagnostics', data);
export const getDiagnostics = () => API.get('/diagnostics');
export const getDiagnostic = (id) => API.get(`/diagnostics/${id}`);

// ─── ADMIN ──────────────────────────────────────────────
export const getUsers = () => API.get('/admin/users');
export const toggleUserActif = (id, actif) => API.put(`/admin/users/${id}/activer`, { actif });
export const supprimerUser = (id) => API.delete(`/admin/users/${id}`);
export const getAdminStats = () => API.get('/admin/stats');

export default API;
