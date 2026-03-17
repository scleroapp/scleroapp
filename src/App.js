import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import BottomNav from './components/BottomNav';
import Login from './pages/Login';
import Home from './pages/Home';
import Tension from './pages/Tension';
import Cuestionarios from './pages/Cuestionarios';
import Citas from './pages/Citas';
import Pruebas from './pages/Pruebas';
import Medicacion from './pages/Medicacion';
import Mas from './pages/Mas';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/tension" element={<ProtectedRoute><Tension /></ProtectedRoute>} />
        <Route path="/cuestionarios" element={<ProtectedRoute><Cuestionarios /></ProtectedRoute>} />
        <Route path="/citas" element={<ProtectedRoute><Citas /></ProtectedRoute>} />
        <Route path="/pruebas" element={<ProtectedRoute><Pruebas /></ProtectedRoute>} />
        <Route path="/medicacion" element={<ProtectedRoute><Medicacion /></ProtectedRoute>} />
        <Route path="/mas" element={<ProtectedRoute><Mas /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
