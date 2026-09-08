import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { AdminRoute } from './components/AdminRoute';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ErrorBoundary } from './components/ErrorBoundary';
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
const LandingPage = lazy(() =>
  import('./pages/LandingPage').then((m) => ({ default: m.LandingPage }))
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

/* Shell that conditionally renders Navbar (hidden on landing page for guest visitors, visible for logged-in users) */
const AppShell: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const isLanding = location.pathname === '/';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {(!isLanding || Boolean(user)) && <Navbar />}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            <Route
              path="/"
              element={
                <ErrorBoundary>
                  <LandingPage />
                </ErrorBoundary>
              }
            />
            <Route
              path="/problems"
              element={
                <ErrorBoundary>
                  <HomePage />
                </ErrorBoundary>
              }
            />
            <Route
              path="/galaxy"
              element={
                <ErrorBoundary>
                  <GalaxyPage />
                </ErrorBoundary>
              }
            />
            <Route
              path="/problems/:code"
              element={
                <ErrorBoundary>
                  <ProblemDetailPage />
                </ErrorBoundary>
              }
            />
            <Route
              path="/profile"
              element={
                <ErrorBoundary>
                  <ProfilePage />
                </ErrorBoundary>
              }
            />

            {/* Protected Admin Routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <ErrorBoundary>
                    <AdminDashboardPage />
                  </ErrorBoundary>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/problems/new"
              element={
                <AdminRoute>
                  <ErrorBoundary>
                    <AdminProblemEditorPage />
                  </ErrorBoundary>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/problems/:id/edit"
              element={
                <AdminRoute>
                  <ErrorBoundary>
                    <AdminProblemEditorPage />
                  </ErrorBoundary>
                </AdminRoute>
              }
            />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>
      <AuthModal />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
