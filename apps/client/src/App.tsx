import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { AdminRoute } from './components/AdminRoute';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { Loader2 } from 'lucide-react';

// Route-level Code Splitting (Issue H-1)
const ProblemDetailPage = lazy(() =>
  import('./pages/ProblemDetailPage').then((m) => ({ default: m.ProblemDetailPage }))
);
const ProfilePage = lazy(() =>
  import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage }))
);
const GalaxyPage = lazy(() =>
  import('./pages/GalaxyPage').then((m) => ({ default: m.GalaxyPage }))
);
const AdminDashboardPage = lazy(() =>
  import('./pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage }))
);
const AdminProblemEditorPage = lazy(() =>
  import('./pages/admin/AdminProblemEditorPage').then((m) => ({ default: m.AdminProblemEditorPage }))
);

const RouteLoadingFallback = () => (
  <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Loader2 size={36} className="animate-spin" style={{ color: 'var(--accent-cyan)' }} />
  </div>
);

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Suspense fallback={<RouteLoadingFallback />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/galaxy" element={<GalaxyPage />} />
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
          </Suspense>
        </main>
          <AuthModal />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
