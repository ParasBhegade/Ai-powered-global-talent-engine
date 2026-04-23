import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import AIAssistant from './components/AIAssistant';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminLoginPage from './pages/AdminLoginPage';
import StudentDashboard from './pages/StudentDashboard';
import ProfilePage from './pages/ProfilePage';
import CareerPathsPage from './pages/CareerPathsPage';
import SkillsPage from './pages/SkillsPage';
import TestPage from './pages/TestPage';
import ResultPage from './pages/ResultPage';
import RecommendationsPage from './pages/RecommendationsPage';
import InterviewSelectPage from './pages/InterviewSelectPage';
import InterviewLivePage from './pages/InterviewLivePage';
import InterviewResultPage from './pages/InterviewResultPage';
import TutorialsPage from './pages/TutorialsPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminAnalytics from './pages/AdminAnalytics';

// Floating back button — shown on inner pages, not on landing/auth
function FloatingBackButton() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();

  const noBackRoutes = ['/', '/login', '/signup', '/admin-login', '/dashboard', '/admin'];
  if (noBackRoutes.includes(location.pathname)) return null;
  if (!user) return null;

  const isLight = theme === 'light';

  return (
    <button
      onClick={() => navigate(-1)}
      title="Go back"
      style={{
        position: 'fixed',
        bottom: 28,
        left: 28,
        zIndex: 9999,
        width: 42,
        height: 42,
        borderRadius: 12,
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
        fontWeight: 700,
        background: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.12)',
        color: isLight ? '#111' : '#fff',
        boxShadow: isLight
          ? '0 2px 12px rgba(0,0,0,0.12)'
          : '0 2px 12px rgba(0,0,0,0.4)',
        backdropFilter: 'blur(10px)',
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.12)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
    >
      ←
    </button>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/admin-login" element={<AdminLoginPage />} />

            {/* Protected Student Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/career-paths" element={<ProtectedRoute><CareerPathsPage /></ProtectedRoute>} />
            <Route path="/skills" element={<ProtectedRoute><SkillsPage /></ProtectedRoute>} />
            <Route path="/test" element={<ProtectedRoute><TestPage /></ProtectedRoute>} />
            <Route path="/result/:id?" element={<ProtectedRoute><ResultPage /></ProtectedRoute>} />
            <Route path="/recommendations" element={<ProtectedRoute><RecommendationsPage /></ProtectedRoute>} />
            <Route path="/interview-select" element={<ProtectedRoute><InterviewSelectPage /></ProtectedRoute>} />
            <Route path="/interview-live" element={<ProtectedRoute><InterviewLivePage /></ProtectedRoute>} />
            <Route path="/interview-result/:sessionId" element={<ProtectedRoute><InterviewResultPage /></ProtectedRoute>} />
            <Route path="/tutorials" element={<ProtectedRoute><TutorialsPage /></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/analytics" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
          </Routes>

          {/* Floating back button on all inner pages */}
          <FloatingBackButton />

          {/* AI Assistant only for logged-in non-interview pages */}
          <AIAssistantWrapper />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

function AIAssistantWrapper() {
  const { user } = useAuth();
  const location = useLocation();
  // Don't show AI assistant during live interview or for admins
  const hideOn = ['/', '/login', '/signup', '/admin-login', '/interview-live'];
  if (!user || user.role === 'admin' || hideOn.includes(location.pathname)) return null;
  return <AIAssistant />;
}
