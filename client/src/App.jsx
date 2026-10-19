import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { Navbar } from './components/layout/Navbar.jsx';
import { Footer } from './components/layout/Footer.jsx';
import { WaveBackground } from './components/ui/WaveBackground.jsx';

// Pages
import { LandingPage } from './pages/LandingPage.jsx';
import { Login } from './pages/Login.jsx';
import { Register } from './pages/Register.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { NewResearch } from './pages/NewResearch.jsx';
import { ResearchWorkspace } from './pages/ResearchWorkspace.jsx';
import { ReportViewer } from './pages/ReportViewer.jsx';
import { SourceLibrary } from './pages/SourceLibrary.jsx';
import { ResearchHistory } from './pages/ResearchHistory.jsx';
import { Compass } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5000,
    },
  },
});

// Protected route guard
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <Compass className="w-8 h-8 animate-spin text-purple-600 mb-2" />
        <p className="text-xs text-pastel-muted">Authenticating session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <div className="relative min-h-screen flex flex-col justify-between">
            {/* Background Pastel Decor */}
            <WaveBackground />

            {/* Navigation Header */}
            <Navbar />

            {/* Page Content */}
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected User Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/research/new"
                  element={
                    <ProtectedRoute>
                      <NewResearch />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/workspace/:id"
                  element={
                    <ProtectedRoute>
                      <ResearchWorkspace />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/report/:id"
                  element={
                    <ProtectedRoute>
                      <ReportViewer />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/sources/:id"
                  element={
                    <ProtectedRoute>
                      <SourceLibrary />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/history"
                  element={
                    <ProtectedRoute>
                      <ResearchHistory />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* Footer */}
            <Footer />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
