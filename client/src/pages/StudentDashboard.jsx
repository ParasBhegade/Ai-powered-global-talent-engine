import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';
import { useTheme } from '../context/ThemeContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function calcCompletion(u) {
  if (!u) return 0;
  const fields = [u.name, u.email, u.phone, u.education, u.experience, u.skills?.length > 0 ? 'y' : ''];
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [latestScore, setLatestScore] = useState(null);
  const [tutorials, setTutorials] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const profileData = await apiFetch('/users/profile');
      setProfile(profileData.user);

      if (profileData.user.selectedPath) {
        const pathId = profileData.user.selectedPath._id || profileData.user.selectedPath;
        const [skillData, tutorialData] = await Promise.all([
          apiFetch(`/careers/${pathId}/skills`),
          apiFetch(`/tutorials/${pathId}`).catch(() => ({ tutorials: [] }))
        ]);
        setSkills(skillData.skills || []);
        setTutorials((tutorialData.tutorials || []).slice(0, 3));
      }

      const scoreData = await apiFetch('/tests/results');
      if (scoreData.results?.length) setLatestScore(scoreData.results[0]);
    } catch (err) { console.error(err); }
  };

  const readiness = latestScore && latestScore.total > 0
    ? Math.round((latestScore.score / latestScore.total) * 100) : 0;

  const career = profile?.selectedPath;
  const hasPath = !!career;
  const hasSkills = skills.length > 0;
  const profileCompletion = calcCompletion(profile);
  const profileIncomplete = profileCompletion < 100;

  const isLight = theme === 'light';
  const tickColor = isLight ? '#4B5563' : '#d6f3ff';
  const strokeColor = isLight ? '#4648D4' : '#c0c1ff';
  const emeraldHighlight = isLight ? '#006C49' : '#4edea2';

  // ── Chart data ──────────────────────────────────────────────────────────────
  // If no test: all zeros (grey). If test: show adjusted proficiency per skill.
  const weakTopics = latestScore?.weakTopics
    ? latestScore.weakTopics.split(',').map(t => t.trim().toLowerCase())
    : [];

  const buildProficiency = () => {
    if (!hasSkills) return [0];
    if (!latestScore) {
      // No test taken — all zeros shown in grey
      return skills.map(() => 0);
    }
    // Has test result — show adjusted bars
    return skills.map(s => {
      const isWeak = weakTopics.some(t => s.skillName.toLowerCase().includes(t));
      return isWeak
        ? Math.max(10, Math.round(s.weight * 0.35))
        : Math.round(s.weight * 0.7 + readiness * 0.3);
    });
  };

  const proficiencyValues = buildProficiency();

  const chartData = {
    labels: hasSkills
      ? skills.map(s => s.skillName)
      : (hasPath ? ['Loading...'] : ['No path selected']),
    datasets: [{
      label: latestScore ? 'Your Proficiency' : 'Take a test to see proficiency',
      data: proficiencyValues,
      backgroundColor: hasSkills
        ? skills.map((_, i) =>
            !latestScore
              ? 'rgba(128,128,128,0.25)'  // grey when no test
              : i % 2 === 0
                ? (isLight ? 'rgba(0,108,73,0.8)' : 'rgba(105,246,184,0.92)')
                : (isLight ? 'rgba(70,72,212,0.8)' : 'rgba(163,166,255,0.92)')
          )
        : ['rgba(128,128,128,0.2)'],
      borderRadius: 8,
      barPercentage: 0.6
    }]
  };

  const profilePhotoUrl = profile?.profilePhoto
    ? `http://localhost:5000/${profile.profilePhoto}` : null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="page-container">

      {/* Profile incomplete alert — top of page */}
      {profileIncomplete && (
        <div style={{
          marginBottom: 16, padding: '11px 18px', borderRadius: 10,
          background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10
        }}>
          <span style={{ color: '#f59e0b', fontWeight: 600, fontSize: 13 }}>
            Profile {profileCompletion}% complete — fill in missing details to boost your visibility.
          </span>
          <Link to="/profile" style={{ color: '#f59e0b', fontWeight: 700, fontSize: 12, textDecoration: 'underline' }}>
            Complete Profile
          </Link>
        </div>
      )}

      {/* Header bar */}
      <div className="glass-card flex items-center justify-between" style={{ marginBottom: 18, padding: '12px 20px' }}>
        <div className="flex items-center gap-3">
          {/* Clean pill toggle */}
          <button
            onClick={() => setSidebarOpen(o => !o)}
            style={{
              background: isLight ? 'rgba(70,72,212,0.08)' : 'rgba(163,166,255,0.1)',
              border: 'none', cursor: 'pointer',
              color: strokeColor,
              padding: '5px 10px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 5,
              transition: 'background 0.2s'
            }}
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <span style={{ fontSize: 12, opacity: 0.8 }}>{sidebarOpen ? '◂' : '▸'}</span>
            {sidebarOpen ? 'Hide' : 'Show'} Panel
          </button>
          <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--on-surface)' }}>Student Dashboard</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--on-surface-variant)', fontWeight: 600 }}>Readiness</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: readiness >= 70 ? emeraldHighlight : readiness > 0 ? '#f59e0b' : 'var(--on-surface-variant)', letterSpacing: '-0.03em' }}>
              {readiness}%
            </div>
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className={sidebarOpen ? 'dashboard-layout' : 'dashboard-layout-nosidebar'}>

        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="sidebar">
            {/* Centered PFP */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              {profilePhotoUrl ? (
                <img
                  src={profilePhotoUrl} alt="Profile"
                  style={{ width: 80, height: 80, borderRadius: 16, objectFit: 'cover', border: `2.5px solid ${strokeColor}55` }}
                />
              ) : (
                <div style={{ width: 80, height: 80, borderRadius: 16, background: `linear-gradient(135deg, ${strokeColor}, ${emeraldHighlight})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: 28 }}>
                  {(profile?.name || 'S')[0].toUpperCase()}
                </div>
              )}
              <div style={{ textAlign: 'center' }}>
                <div className="profile-name" style={{ fontSize: 15 }}>{profile?.name || 'Student'}</div>
                <div className="profile-email" style={{ fontSize: 11, marginBottom: 0 }}>{profile?.email || ''}</div>
              </div>
            </div>

            <div className="sidebar-links">
              <Link to="/profile">View Profile</Link>
              <Link to="/career-paths">Choose Path</Link>
              <Link to="/test">Start Test</Link>
              <Link to="/recommendations">Recommendations</Link>
              <Link to="/tutorials">Tutorials</Link>
              <Link to="/interview-select">AI Interview</Link>
            </div>
            <div className="sidebar-tip" style={{ fontSize: 12 }}>
              Complete your profile and practice the AI interview to increase your readiness score.
            </div>
          </aside>
        )}

        <main>
          {/* Career Card */}
          <div className="glass-card" style={{ marginBottom: 18 }}>
            <div className="section-title">Selected Career <small>— your focus</small></div>
            {career ? (
              <>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--on-surface)' }}>{career.name}</div>
                <div style={{ color: 'var(--on-surface-variant)', marginTop: 6, fontSize: 14 }}>{career.description}</div>
              </>
            ) : (
              <>
                <div className="text-muted">No career selected yet.</div>
                <div className="text-sm text-muted" style={{ marginTop: 6 }}>Choose a career path to receive tailored recommendations and interview questions.</div>
                <Link to="/career-paths" className="btn-cta" style={{ marginTop: 14, fontSize: 13, display: 'inline-block' }}>Select Career Path</Link>
              </>
            )}
          </div>

          {/* Skill Proficiency Chart */}
          <div className="glass-card" style={{ marginBottom: 18 }}>
            <div className="section-title" style={{ marginBottom: 8 }}>
              Skill Proficiency <small>— {latestScore ? 'based on your last test' : 'take a test to see your level'}</small>
            </div>
            {!hasPath ? (
              <div className="text-muted text-sm" style={{ padding: '16px 0', textAlign: 'center' }}>Select a career path to see your skill chart.</div>
            ) : (
              <>
                <div style={{ height: 190 }}>
                  <Bar data={chartData} options={{
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      x: { ticks: { color: tickColor, font: { size: 10 } }, grid: { display: false } },
                      y: {
                        ticks: { color: tickColor, font: { size: 10 } },
                        grid: { color: 'rgba(128,128,128,0.08)' },
                        min: 0, max: 100
                      }
                    }
                  }} />
                </div>
                {!latestScore && hasPath && (
                  <div style={{ marginTop: 10, textAlign: 'center', padding: '8px 0', borderTop: `1px solid ${isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)'}` }}>
                    <span className="text-sm text-muted">Bars will fill once you </span>
                    <Link to="/test" style={{ fontSize: 13, color: strokeColor, fontWeight: 700 }}>take the aptitude test</Link>
                  </div>
                )}
                {latestScore && (
                  <div style={{ marginTop: 8, fontSize: 13 }}>
                    <span className="text-muted">Latest test: </span>
                    <span className="text-accent font-bold">{latestScore.score}/{latestScore.total}</span>
                    <span className="text-muted"> ({readiness}%)</span>
                    {latestScore.weakTopics && <span className="text-muted"> — Weak: {latestScore.weakTopics}</span>}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Tutorials mini section */}
          {tutorials.length > 0 && (
            <div className="glass-card" style={{ marginBottom: 18 }}>
              <div className="section-title" style={{ marginBottom: 10 }}>
                Tutorials <small>— for your path</small>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {tutorials.map(t => (
                  <a
                    key={t._id}
                    href={t.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'block',
                      padding: '10px 14px', borderRadius: 10,
                      background: isLight ? 'rgba(70,72,212,0.05)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${isLight ? 'rgba(70,72,212,0.1)' : 'rgba(255,255,255,0.05)'}`,
                      textDecoration: 'none',
                      transition: 'background 0.2s'
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--on-surface)' }}>{t.title}</div>
                    {t.summary && <div style={{ fontSize: 11, color: 'var(--on-surface-variant)', marginTop: 2 }}>{t.summary}</div>}
                  </a>
                ))}
              </div>
              <Link to="/tutorials" style={{ display: 'inline-block', marginTop: 10, fontSize: 12, color: strokeColor, fontWeight: 600 }}>
                View all tutorials →
              </Link>
            </div>
          )}

          {/* Stats Row */}
          <div className="glass-card" style={{ display: 'flex', gap: 0, flexWrap: 'wrap' }}>
            <div style={{ flex: '0 0 200px', padding: '14px 20px', borderRight: `1px solid ${isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)'}` }}>
              <div className="text-sm text-muted">Readiness Score</div>
              <div className="text-accent font-black" style={{ fontSize: 32, marginTop: 4, letterSpacing: '-0.03em' }}>{readiness}%</div>
              <div className="text-sm text-muted" style={{ marginTop: 6 }}>
                {readiness === 0 ? 'Select a path and take a test.' : readiness >= 70 ? 'Great progress! Keep going.' : 'Keep practicing to improve.'}
              </div>
            </div>
            <div style={{ flex: 1, padding: '14px 20px' }}>
              <div className="text-sm text-muted">Recent Activity</div>
              <ul style={{ margin: '8px 0 0 18px', color: 'var(--on-surface-variant)', fontSize: 13, lineHeight: 1.8 }}>
                {latestScore && <li>Test taken — {formatDate(latestScore.createdAt)} ({latestScore.score}/{latestScore.total})</li>}
                {profile?.updatedAt && <li>Profile updated — {formatDate(profile.updatedAt)}</li>}
                {!latestScore && !profile?.updatedAt && <li>No activity yet — get started!</li>}
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
