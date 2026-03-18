import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/AuthProvider';
import { useAuthStore } from './store/authStore';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Library } from './pages/Library';
import { BookDetails } from './pages/BookDetails';
import { Reader } from './pages/Reader';
import { Upload } from './pages/Upload';
import { Login } from './pages/Login';
import { Settings } from './pages/Settings';
import { Admin } from './pages/Admin';
import { Contact } from './pages/Contact';
import { Privacy } from './pages/Privacy';
import { NotFound } from './pages/NotFound';
import { Toaster } from 'sonner';

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
  const { user, profile, isAuthReady } = useAuthStore();

  if (!isAuthReady) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!user) return <Navigate to="/login" />;

  if (adminOnly && profile?.role !== 'admin') return <Navigate to="/" />;

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-center" />
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="library" element={<Library />} />
            <Route path="contact" element={<Contact />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="book/:id" element={<BookDetails />} />
            <Route path="read/:id" element={<ProtectedRoute><Reader /></ProtectedRoute>} />
            <Route path="upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
            <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
