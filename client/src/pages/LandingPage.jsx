import { useRef, useCallback, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import AIAssistant from '../components/AIAssistant';
import darkIcon from '../assets/dark.png';
import lightIcon from '../assets/light.png';

export default function LandingPage() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const companies = ['TCS', 'Wipro', 'Deloitte', 'Infosys', 'Cognizant', 'IBM', 'Accenture', 'Tech Mahindra', 'Capgemini', 'HCL', 'Amazon', 'Google'];

  // Cursor glow
  const glowRef = useRef(null);
  const handleMouseMove = useCallback((e) => {
    if (glowRef.current) {
      glowRef.current.style.left = `${e.clientX}px`;
      glowRef.current.style.top = `${e.clientY}px`;
    }
  }, []);

  // Scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="landing-page-wrapper" onMouseMove={handleMouseMove}>
      <div className="landing-cursor-glow" ref={glowRef} />
      <div className="auth-theme-toggle" onClick={toggleTheme}>
        <img src={lightIcon} className={`theme-toggle-img ${theme === 'light' ? 'active' : ''}`} alt="Light Mode" />
        <img src={darkIcon} className={`theme-toggle-img ${theme === 'dark' ? 'active' : ''}`} alt="Dark Mode" />
      </div>

      <div className="auth-top-nav">
        {user ? (
          <>
            <Link to="/" className={`auth-nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
            <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="auth-nav-link">Dashboard</Link>
            <span onClick={handleLogout} className="auth-nav-link" style={{ cursor: 'pointer' }}>Log out</span>
          </>
        ) : (
          <>
            <Link to="/admin-login" className="auth-nav-link">Admin</Link>
            <Link to="/signup" className="auth-nav-link">Sign up</Link>
            <Link to="/login" className="auth-nav-link">Log in</Link>
          </>
        )}
      </div>

      {/* 1. HERO SECTION */}
      <section className="landing-hero">
        <div className="landing-hero-content reveal reveal-up">
          <h1 className="landing-hero-title">BUILD SMARTER CAREERS <br/> WITH TALENT INTELLIGENCE</h1>
          <p className="landing-hero-subtitle">
            Data-driven career pipelines, AI-powered mock interviews,<br/>
            and real-time proficiency tracking — all in one platform.
          </p>

          <div className="landing-cta-card-wrapper">
             <div className="landing-cta-glow"></div>
             <div className="landing-cta-card">
               <h2>Mock interviews. Track skills. Get ready.</h2>
               <p>AI-driven interviews and simple progress tracking for real-world readiness.</p>
               <div className="landing-cta-actions">
                 <Link to="/interview-select" className="btn-cta-landing-dark">Start An AI Interview</Link>
                 <Link to="/career-paths" className="btn-cta-landing-white">Explore Career Paths</Link>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* 2. KEY HIGHLIGHTS SECTION */}
      <section className="landing-highlights">
        <div className="landing-highlights-container reveal reveal-up">
          <h2 className="landing-highlights-title">KEY HIGHLIGHTS</h2>
          
          <div className="landing-highlights-grid">
            <div className="landing-highlight-card reveal reveal-up" style={{ '--delay': '0ms' }}>
              <h3>Live AI Interviews</h3>
              <p>Real-time camera + speech mock<br/>interviews with AI scoring.</p>
            </div>
            <div className="landing-highlight-card reveal reveal-up" style={{ '--delay': '80ms' }}>
              <h3>Skill Mapping</h3>
              <p>Discover strengths & gaps instantly.</p>
            </div>
            <div className="landing-highlight-card reveal reveal-up" style={{ '--delay': '160ms' }}>
              <h3>Company Aptitude</h3>
              <p>Company-specific aptitude practice.</p>
            </div>
            <div className="landing-highlight-card reveal reveal-up" style={{ '--delay': '240ms' }}>
              <h3>Resume Insights</h3>
              <p>AI-powered feedback to improve<br/>your resume.</p>
            </div>
            <div className="landing-highlight-card reveal reveal-up" style={{ '--delay': '320ms' }}>
              <h3>Progress Dashboard</h3>
              <p>Track your performance.</p>
            </div>
            <div className="landing-highlight-card reveal reveal-up" style={{ '--delay': '400ms' }}>
              <h3>Interview Notes</h3>
              <p>Store AI feedback & suggestions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. COMPANIES SECTION */}
      <section className="landing-companies">
        <div className="landing-companies-content">
          <h2 className="landing-companies-title reveal reveal-up">COMPANIES</h2>
          <div className="landing-companies-marquee-wrapper reveal reveal-up" style={{ '--delay': '100ms' }}>
             <div className="landing-companies-marquee">
                {companies.concat(companies).map((company, i) => (
                   <div key={i} className="landing-company-pill">{company}</div>
                ))}
             </div>
          </div>
        </div>
      </section>

      {/* 4. FAQ SECTION */}
      <section className="landing-faq">
        <div className="landing-faq-content">
          <h2 className="landing-faq-title reveal reveal-up">FAQS</h2>
          
          <div className="landing-faq-list">
            <div className="landing-faq-item reveal reveal-up" style={{ '--delay': '0ms' }}>
              <strong>1. Is this platform enough for placement prep?</strong>
              <p className="landing-faq-answer">-Yes — interviews, aptitude, coding & AI analytics included.</p>
            </div>
            <div className="landing-faq-item reveal reveal-up" style={{ '--delay': '80ms' }}>
              <strong>2. Are mock interviews AI evaluated?</strong>
              <p className="landing-faq-answer">-Yes — speech, clarity & logic are scored instantly.</p>
            </div>
            <div className="landing-faq-item reveal reveal-up" style={{ '--delay': '160ms' }}>
              <strong>3. Do you offer company-specific practice?</strong>
              <p className="landing-faq-answer">-Yes — TCS, Wipro, Deloitte, Infosys & more.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="landing-footer reveal reveal-up">
        © 2026 Talent Intelligence System — Engineered for technical excellence.
      </footer>
      
      <AIAssistant />
    </div>
  );
}
