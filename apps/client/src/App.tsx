import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { AdminRoute } from './components/AdminRoute';
import { HomePage } from './pages/HomePage';
import { ProblemDetailPage } from './pages/ProblemDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminProblemEditorPage } from './pages/admin/AdminProblemEditorPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/problems/:code" element={<ProblemDetailPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              
              {/* Protected Admin Routes */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboardPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/problems/new"
                element={
                  <AdminRoute>
                    <AdminProblemEditorPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/problems/:id/edit"
                element={
                  <AdminRoute>
                    <AdminProblemEditorPage />
                  </AdminRoute>
                }
              />

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <AuthModal />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
