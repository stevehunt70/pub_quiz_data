// src/App.jsx
import { Toaster } from '@/components/ui/toaster';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from '@/lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import Landing from '@/pages/Landing';
import Dashboard from '@/pages/Dashboard';
import GenerateQuiz from '@/pages/GenerateQuiz';
import QuizHistory from '@/pages/QuizHistory';
import ArtistLookup from '@/pages/ArtistLookup';

// ⭐ FIXED VERSION ⭐
const AuthenticatedApp = () => {
  const { isLoadingAuth, authError, navigateToLogin } = useAuth();
  const location = window.location.pathname;

  const isPublicRoute = location === "/welcome";

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Only redirect if NOT on a public route
  if (!isPublicRoute && authError?.type === "auth_required") {
    navigateToLogin();
    return null;
  }

  return (
    <Routes>
      {/* PUBLIC */}
      <Route path="/welcome" element={<Landing />} />

      {/* PROTECTED */}
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="/generate" element={<GenerateQuiz />} />
        <Route path="/history" element={<QuizHistory />} />
        <Route path="/artist-lookup" element={<ArtistLookup />} />
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;