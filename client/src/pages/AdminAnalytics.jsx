import { useState, useEffect } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import { apiFetch } from '../utils/api';
import { useTheme } from '../context/ThemeContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  const isLight = theme === 'light';
  const strokeColor = isLight ? '#4648D4' : '#c0c1ff';
  const emeraldHighlight = isLight ? '#006C49' : '#4edea2';
  const labelColor = isLight ? '#111C2D' : '#dee5ff';
  const tickColor = isLight ? '#4B5563' : '#908fa0';
  const gridColor = isLight ? 'rgba(17,28,45,0.07)' : 'rgba(255,255,255,0.04)';

  useEffect(() => {
    apiFetch('/admin/analytics')
      .then(d => { setData(d); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  if (loading) return <div className="loading-screen text-accent">Loading analytics...</div>;
  if (!data) return <div className="page-container"><h2 className="text-accent">Failed to load analytics data.</h2></div>;

  const pathStats = data.pathStats || [];
  const topWeak = data.topWeak || [];
  const latestTests = data.latestTests || [];

  // Chart: Avg Score by Path
  const avgScoreData = {
    labels: pathStats.map(p => p.name),
    datasets: [{
      label: 'Avg Score %',
      data: pathStats.map(p => p.avgScore),
      backgroundColor: pathStats.map((_, i) => i % 2 === 0
        ? (isLight ? 'rgba(0,108,73,0.82)' : 'rgba(78,222,162,0.82)')
        : (isLight ? 'rgba(70,72,212,0.82)' : 'rgba(192,193,255,0.82)')
      ),
      borderRadius: 6,
      barThickness: 18
    }]
  };

  // Pie: Users per path — only include paths with at least 1 user
  const activePaths = pathStats.filter(p => p.userCount > 0);
  const usersPerPathData = {
    labels: activePaths.map(p => p.name),
    datasets: [{
      data: activePaths.map(p => p.userCount),
      backgroundColor: activePaths.map((_, i) => `hsl(${(i * 53) % 360} 65% 58% / 0.85)`),
      borderWidth: 0
    }]
  };

  const statTiles = [
    { label: 'Total Users', val: data.totUsers ?? 0, sub: 'Registered students', color: strokeColor },
    { label: 'Tests Taken', val: data.totTests ?? 0, sub: 'All aptitude tests', color: emeraldHighlight },
    { label: 'Avg Score', val: data.avgScoreOverall ? `${data.avgScoreOverall}%` : '—', sub: 'Across all paths', color: isLight ? '#D97706' : '#fbbf24' },
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="text-accent" style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Admin Analytics</h1>
          <p className="text-muted" style={{ fontSize: 13 }}>Real-time data from tests, users, and career paths.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: emeraldHighlight, display: 'inline-block' }} />
          <span style={{ fontSize: 12, color: emeraldHighlight, fontWeight: 600 }}>System Active</span>
        </div>
      </div>

      {/* Row 1 — Stat Tiles (full width row, flex) */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        {statTiles.map((st, i) => (
          <div key={i} className="glass-card" style={{ flex: '1 1 160px', textAlign: 'center', padding: '18px 14px', minWidth: 140 }}>
            <p className="text-muted" style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.05em' }}>{st.label}</p>
            <div style={{ fontSize: 32, fontWeight: 900, color: st.color, letterSpacing: '-0.03em' }}>{st.val}</div>
            <p className="text-muted" style={{ fontSize: 11, marginTop: 6 }}>{st.sub}</p>
          </div>
        ))}
      </div>

      {/* Row 2 — Bar Chart + Pie Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 20 }}>
        {/* Bar: Avg Score by path */}
        <div className="glass-card">
          <h3 className="text-accent" style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>Average Score by Career Path</h3>
          <p className="text-muted" style={{ fontSize: 12, marginBottom: 16 }}>Percentage correct per path — higher is better</p>
          {pathStats.length === 0 ? (
            <p className="text-muted text-sm">No test data yet.</p>
          ) : (
            <div style={{ height: 280 }}>
              <Bar data={avgScoreData} options={{
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { max: 100, grid: { color: gridColor }, ticks: { color: tickColor, font: { size: 11 } } },
                  y: { grid: { display: false }, ticks: { color: labelColor, font: { size: 12, weight: '600' } } }
                }
              }} />
            </div>
          )}
        </div>

        {/* Pie: Users per path */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 className="text-accent" style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>Students per Path</h3>
          <p className="text-muted" style={{ fontSize: 12, marginBottom: 16 }}>Career path selection distribution</p>
          {activePaths.length === 0 ? (
            <p className="text-muted text-sm">No path selections yet.</p>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 220 }}>
              <Pie data={usersPerPathData} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: { color: labelColor, font: { size: 10 }, padding: 10, boxWidth: 12 }
                  }
                }
              }} />
            </div>
          )}
        </div>
      </div>

      {/* Row 3 — Weak Topics + Path Performance Table */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, marginBottom: 20 }}>
        {/* Weak Topics */}
        <div className="glass-card">
          <h3 className="text-accent" style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>Top Weak Topics</h3>
          <p className="text-muted" style={{ fontSize: 12, marginBottom: 16 }}>Most common wrong questions</p>
          {topWeak.length === 0 ? (
            <p className="text-muted text-sm">No weak topic data yet.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {topWeak.map(([topic, count], i) => (
                <li key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 13, color: labelColor, fontWeight: 600 }}>
                    {i + 1}. {topic.charAt(0).toUpperCase() + topic.slice(1)}
                  </span>
                  <span style={{ padding: '2px 9px', borderRadius: 999, background: `${strokeColor}18`, color: strokeColor, fontSize: 11, fontWeight: 800 }}>
                    {count}x
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Path Performance Table */}
        <div className="glass-card" style={{ overflowX: 'auto' }}>
          <h3 className="text-accent" style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>Path Performance</h3>
          <p className="text-muted" style={{ fontSize: 12, marginBottom: 16 }}>Students and average score per career path</p>
          {pathStats.length === 0 ? (
            <p className="text-muted text-sm">No career paths yet.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Career Path', 'Students', 'Avg Score'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 10px', color: 'var(--primary)', fontSize: 12, borderBottom: `1px solid ${isLight ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.06)'}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pathStats.map((p, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.03)'}` }}>
                    <td style={{ padding: '8px 10px', fontWeight: 600, color: labelColor, fontSize: 13 }}>{p.name}</td>
                    <td style={{ padding: '8px 10px', color: tickColor, fontSize: 13 }}>{p.userCount}</td>
                    <td style={{ padding: '8px 10px', fontSize: 13 }}>
                      <span style={{ color: p.avgScore >= 70 ? emeraldHighlight : (p.avgScore >= 40 ? '#f59e0b' : '#ff6b6b'), fontWeight: 700 }}>
                        {p.avgScore}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Row 4 — Latest Tests Table */}
      <div className="glass-card" style={{ overflowX: 'auto' }}>
        <h3 className="text-accent" style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>Latest Tests</h3>
        <p className="text-muted" style={{ fontSize: 12, marginBottom: 16 }}>Most recent 20 test submissions</p>
        {latestTests.length === 0 ? (
          <p className="text-muted text-sm">No tests taken yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 580 }}>
            <thead>
              <tr>
                {['User', 'Career Path', 'Score', 'Weak Topics', 'Date'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 10px', color: 'var(--primary)', fontSize: 12, borderBottom: `1px solid ${isLight ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.06)'}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {latestTests.map((t, i) => {
                const pct = t.total > 0 ? Math.round((t.score / t.total) * 100) : 0;
                return (
                  <tr key={i} style={{ borderBottom: `1px solid ${isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.03)'}` }}>
                    <td style={{ padding: '8px 10px', fontWeight: 600, color: labelColor, fontSize: 13 }}>{t.user?.name || '—'}</td>
                    <td style={{ padding: '8px 10px', color: tickColor, fontSize: 13 }}>{t.careerPath?.name || '—'}</td>
                    <td style={{ padding: '8px 10px', fontSize: 13 }}>
                      <span style={{ color: pct >= 70 ? emeraldHighlight : (pct >= 40 ? '#f59e0b' : '#ff6b6b'), fontWeight: 700 }}>
                        {t.score}/{t.total} ({pct}%)
                      </span>
                    </td>
                    <td style={{ padding: '8px 10px', color: tickColor, fontSize: 12, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.weakTopics || '—'}
                    </td>
                    <td style={{ padding: '8px 10px', color: tickColor, fontSize: 12 }}>
                      {new Date(t.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
