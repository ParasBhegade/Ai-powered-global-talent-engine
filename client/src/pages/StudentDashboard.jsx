import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';
import { useTheme } from '../context/ThemeContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// Profile completion helper (6 fields)
function calcCompletion(u) {
  if (!u) return 0;
  const fields = [u.name, u.email, u.phone, u.education, u.experience, u.skills?.length > 0 ? 'y' : ''];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
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

  // Build proficiency values: if user has weak topics, reduce those bars
  const weakTopics = latestScore?.weakTopics
    ? latestScore.weakTopics.split(',').map(t => t.trim().toLowerCase())
    : [];

  const proficiencyValues = hasSkills
    ? skills.map(s => {
        const isWeak = weakTopics.some(t => s.skillName.toLowerCase().includes(t));
        return isWeak ? Math.round(s.weight * 0.45) : s.weight;
      })
    : [0];

  const chartData = {
    labels: hasSkills ? skills.map(s => s.skillName) : (hasPath ? ['Loading...'] : ['No path selected']),
    datasets: [{
      label: latestScore ? 'Your Proficiency' : 'Skill Weight',
      data: proficiencyValues,
      backgroundColor: hasSkills
        ? skills.map((_, i) =>
            i % 2 === 0
              ? (isLight ? 'rgba(0,108,73,0.8)' : 'rgba(105,246,184,0.92)')
              : (isLight ? 'rgba(70,72,212,0.8)' : 'rgba(163,166,255,0.92)')
          )
        : ['rgba(128,128,128,0.3)'],
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
      {/* Header bar */}
      <div className="glass-card flex justify-between items-center" style={{ marginBottom: 18 }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(o => !o)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: 20, lineHeight: 1, padding: '4px 6px', borderRadius: 6 }}
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
          <div style={{ fontWeight: 800, fontSize: 20, color: 'var(--on-surface)' }}>Student Dashboard</div>
        </div>
        <span className="text-accent font-bold" style={{ fontSize: 15 }}>
          Readiness: {readiness}%
          {readiness === 0 && <span className="text-muted text-sm" style={{ marginLeft: 6, fontWeight: 400 }}>(Take a test to update)</span>}
        </span>
      </div>

      {/* Profile incomplete alert */}
      {profileIncomplete && (
        <div style={{
          marginBottom: 16, padding: '12px 18px', borderRadius: 10,
          background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.35)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10
        }}>
          <span style={{ color: '#f59e0b', fontWeight: 600, fontSize: 14 }}>
            Profile {profileCompletion}% complete — fill in missing info to increase visibility.
          </span>
          <Link to="/profile" style={{ color: '#f59e0b', fontWeight: 700, fontSize: 13, textDecoration: 'underline' }}>
            Complete Profile
          </Link>
        </div>
      )}

      <div className="dashboard-layout" style={{ gridTemplateColumns: sidebarOpen ? undefined : '1fr' }}>
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="sidebar">
            {/* Centered PFP */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              {profilePhotoUrl ? (
                <img
                  src={profilePhotoUrl} alt="Profile"
                  style={{ width: 72, height: 72, borderRadius: 16, objectFit: 'cover', border: '2px solid var(--primary)' }}
                />
              ) : (
                <div style={{ width: 72, height: 72, borderRadius: 16, background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: 24 }}>
                  {(profile?.name || 'S')[0].toUpperCase()}
                </div>
              )}
              <div style={{ textAlign: 'center' }}>
                <div className="profile-name" style={{ fontSize: 16 }}>{profile?.name || 'Student'}</div>
                <div className="profile-email" style={{ fontSize: 12 }}>{profile?.email || ''}</div>
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
            <div className="sidebar-tip">
              <strong>Tip:</strong> Complete your profile and practice the AI interview to increase your readiness score.
            </div>
          </aside>
        )}

        <main>
          {/* Career Card */}
          <div className="glass-card" style={{ marginBottom: 18 }}>
            <div className="section-title">Selected Career <small>— your focus</small></div>
            {career ? (
              <>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--on-surface)' }}>{career.name}</div>
                <div style={{ color: 'var(--on-surface-variant)', marginTop: 8, fontSize: 14 }}>{career.description}</div>
              </>
            ) : (
              <>
                <div className="text-muted">No career selected</div>
                <div className="text-sm text-muted" style={{ marginTop: 6 }}>Choose a career path to receive tailored recommendations and interview questions.</div>
                <Link to="/career-paths" className="btn-cta" style={{ marginTop: 12, fontSize: 14, display: 'inline-block' }}>Select Career Path</Link>
              </>
            )}
          </div>

          {/* Skill Progress + Chart (compact) */}
          <div className="glass-card" style={{ marginBottom: 18 }}>
            <div className="section-title" style={{ marginBottom: 10 }}>
              Skill Proficiency <small>— {latestScore ? 'based on your test results' : 'based on career path'}</small>
            </div>
            {!hasPath ? (
              <div className="text-muted text-sm" style={{ padding: '18px 0', textAlign: 'center' }}>
                Select a career path to see skill chart.
              </div>
            ) : (
              <div style={{ height: 210 }}>
                <Bar data={chartData} options={{
                  responsive: true, maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { ticks: { color: tickColor, font: { size: 10 } }, grid: { display: false } },
                    y: {
                      ticks: { color: tickColor, font: { size: 10 } },
                      grid: { color: 'rgba(128,128,128,0.1)' },
                      min: 0, max: 100
                    }
                  }
                }} />
              </div>
            )}
            {latestScore ? (
              <div className="mt-2" style={{ fontSize: 13 }}>
                <span className="text-muted">Latest test: </span>
                <span className="text-accent font-bold">{latestScore.score}/{latestScore.total}</span>
                <span className="text-muted"> ({readiness}%)</span>
                {latestScore.weakTopics && <span className="text-muted"> — Weak: {latestScore.weakTopics}</span>}
              </div>
            ) : hasPath ? (
              <div className="text-sm text-muted mt-2">No test taken yet. <Link to="/test" style={{ color: 'var(--primary)' }}>Take the mock test</Link> to see your proficiency.</div>
            ) : null}
          </div>

          {/* Tutorials mini section */}
          {tutorials.length > 0 && (
            <div className="glass-card" style={{ marginBottom: 18 }}>
              <div className="section-title" style={{ marginBottom: 12 }}>
                Tutorials <small>— for your path</small>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {tutorials.map(t => (
                  <div key={t._id} style={{ padding: '10px 14px', borderRadius: 10, background: isLight ? 'rgba(70,72,212,0.05)' : 'rgba(255,255,255,0.04)', border: `1px solid ${isLight ? 'rgba(70,72,212,0.1)' : 'rgba(255,255,255,0.06)'}` }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--on-surface)', marginBottom: 2 }}>{t.title}</div>
                    {t.summary && <div style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>{t.summary}</div>}
                  </div>
                ))}
              </div>
              <Link to="/tutorials" style={{ display: 'inline-block', marginTop: 10, fontSize: 13, color: strokeColor, fontWeight: 600 }}>
                View all tutorials
              </Link>
            </div>
          )}

          {/* Stats Row */}
          <div className="glass-card flex gap-3" style={{ flexWrap: 'wrap' }}>
            <div style={{ flex: '0 0 220px', padding: 14 }}>
              <div className="text-sm text-muted">Readiness Score</div>
              <div className="text-accent font-black" style={{ fontSize: 28, marginTop: 6 }}>{readiness}%</div>
              <div className="text-sm text-muted" style={{ marginTop: 8 }}>
                {readiness === 0 ? 'Select a path and take a test to begin.' : 'Keep practicing to improve.'}
              </div>
            </div>
            <div style={{ flex: 1, padding: 14 }}>
              <div className="text-sm text-muted">Recent Activity</div>
              <ul style={{ margin: '8px 0 0 18px', color: 'var(--on-surface-variant)', fontSize: 14 }}>
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
