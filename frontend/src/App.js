import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './services/AuthContext';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import DiagnosticPage from './pages/DiagnosticPage';
import ParcellesPage from './pages/ParcellesPage';
import CartePage from './pages/CartePage';
import AdminPage from './pages/AdminPage';
import './index.css';

// Route protégée : redirige vers /login si non connecté
function RouteProtegee({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loader">⏳ Chargement...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

// Route admin uniquement
function RouteAdmin({ children }) {
  const { user } = useAuth();
  return user?.role === 'admin' ? children : <Navigate to="/dashboard" replace />;
}

// Layout avec sidebar
function Layout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="/dashboard" element={
        <RouteProtegee>
          <Layout><Dashboard /></Layout>
        </RouteProtegee>
      } />

      <Route path="/diagnostic" element={
        <RouteProtegee>
          <Layout><DiagnosticPage /></Layout>
        </RouteProtegee>
      } />

      <Route path="/parcelles" element={
        <RouteProtegee>
          <Layout><ParcellesPage /></Layout>
        </RouteProtegee>
      } />

      <Route path="/carte" element={
        <RouteProtegee>
          <Layout><CartePage /></Layout>
        </RouteProtegee>
      } />

      <Route path="/admin" element={
        <RouteProtegee>
          <RouteAdmin>
            <Layout><AdminPage /></Layout>
          </RouteAdmin>
        </RouteProtegee>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
