import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import darkIcon from '../assets/dark.png';
import lightIcon from '../assets/light.png';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Hide navbar on landing, auth, AND live interview (no distractions)
  const hideOnRoutes = ['/', '/login', '/signup', '/admin-login', '/interview-live'];
  if (hideOnRoutes.includes(location.pathname)) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="app-navbar">
      <div className="app-navbar-inner">
        <div className="app-navbar-left">
          <div className="app-navbar-theme" onClick={toggleTheme} title="Toggle theme">
            <img src={lightIcon} className={`theme-toggle-img ${theme === 'light' ? 'active' : ''}`} alt="Light" />
            <img src={darkIcon} className={`theme-toggle-img ${theme === 'dark' ? 'active' : ''}`} alt="Dark" />
          </div>
        </div>

        <div className="app-navbar-links">
          {user ? (
            <>
              {/* Home always visible for logged-in users */}
              <Link to="/" className={`auth-nav-link ${isActive('/') ? 'active' : ''}`}>Home</Link>

              {/* Student links */}
              {user.role !== 'admin' && (
                <>
                  <Link to="/dashboard" className={`auth-nav-link ${isActive('/dashboard') ? 'active' : ''}`}>Dashboard</Link>
                  <Link to="/profile" className={`auth-nav-link ${isActive('/profile') ? 'active' : ''}`}>Profile</Link>
                  <Link to="/career-paths" className={`auth-nav-link ${isActive('/career-paths') ? 'active' : ''}`}>Paths</Link>
                  <Link to="/tutorials" className={`auth-nav-link ${isActive('/tutorials') ? 'active' : ''}`}>Tutorials</Link>
                </>
              )}

              {/* Admin links */}
              {user.role === 'admin' && (
                <>
                  <Link to="/admin" className={`auth-nav-link ${isActive('/admin') ? 'active' : ''}`}>Dashboard</Link>
                  <Link to="/admin/analytics" className={`auth-nav-link ${isActive('/admin/analytics') ? 'active' : ''}`}>Analytics</Link>
                </>
              )}

              <span onClick={handleLogout} className="auth-nav-link" style={{ cursor: 'pointer' }}>Log out</span>
            </>
          ) : (
            <>
              <Link to="/" className={`auth-nav-link ${isActive('/') ? 'active' : ''}`}>Home</Link>
              <Link to="/admin-login" className="auth-nav-link">Admin</Link>
              <Link to="/signup" className="auth-nav-link">Sign up</Link>
              <Link to="/login" className="auth-nav-link">Log in</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
