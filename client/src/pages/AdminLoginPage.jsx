import { useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import darkIcon from '../assets/dark.png';
import lightIcon from '../assets/light.png';
import eyeIcon from '../assets/eye.png';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { adminLogin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const glowRef = useRef(null);
  const handleMouseMove = useCallback((e) => {
    if (glowRef.current) {
      glowRef.current.style.left = `${e.clientX}px`;
      glowRef.current.style.top = `${e.clientY}px`;
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await adminLogin(email, password);
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-page-container" onMouseMove={handleMouseMove}>
      <div className="auth-cursor-glow" ref={glowRef} />
      <div className="auth-theme-toggle" onClick={toggleTheme}>
        <img src={lightIcon} className={`theme-toggle-img ${theme === 'light' ? 'active' : ''}`} alt="Light Mode" />
        <img src={darkIcon} className={`theme-toggle-img ${theme === 'dark' ? 'active' : ''}`} alt="Dark Mode" />
      </div>

      <div className="auth-top-nav">
        <Link to="/" className={`auth-nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
        <Link to="/admin-login" className={`auth-nav-link ${location.pathname === '/admin-login' ? 'active' : ''}`}>Admin</Link>
        <Link to="/signup" className={`auth-nav-link ${location.pathname === '/signup' ? 'active' : ''}`}>Sign up</Link>
        <Link to="/login" className={`auth-nav-link ${location.pathname === '/login' ? 'active' : ''}`}>Log in</Link>
      </div>

      <div className="auth-glow"></div>

      <div className="auth-center">
        <h1 className="auth-title">AI TALENT ENGINE</h1>
        
        <div className="auth-box">
          <h2>Admin Login</h2>
          {error && <div className="auth-error">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="auth-input-group">
              <input type="email" className="auth-pill-input" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            
            <div className="auth-input-group">
              <input type={showPassword ? "text" : "password"} className="auth-pill-input" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={{paddingRight: 48}} />
              <img src={eyeIcon} alt="Toggle Password Visibility" className="auth-eye-icon" onClick={() => setShowPassword(!showPassword)} />
            </div>
            
            <button type="submit" className="auth-submit-btn">Log in</button>
          </form>
        </div>
      </div>
    </div>
  );
}
