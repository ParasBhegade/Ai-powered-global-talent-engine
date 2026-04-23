import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  const surfaceHigh = isLight ? '#EBF0FA' : '#222a3d';
  const labelColor = isLight ? '#111C2D' : '#dee5ff';
  const tickColor = isLight ? '#4B5563' : '#908fa0';
  const gridColor = isLight ? 'rgba(17,28,45,0.08)' : 'rgba(255,255,255,0.05)';

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
        ? (isLight ? 'rgba(0,108,73,0.85)' : 'rgba(78,222,162,0.85)')
        : (isLight ? 'rgba(70,72,212,0.85)' : 'rgba(192,193,255,0.85)')
      ),
      borderRadius: 8,
      barThickness: 22
    }]
  };

  // Chart: Users per Path (Pie)
  const usersPerPathData = {
    labels: pathStats.map(p => p.name),
    datasets: [{
      data: pathStats.map(p => p.userCount),
      backgroundColor: pathStats.map((_, i) => `hsl(${i * 47 % 360} 70% 55% / 0.8)`),
      borderWidth: 0
    }]
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-end mb-8 gap-4">
        <div>
          <h1 className="text-accent" style={{ fontSize: '28px', marginBottom: 6, fontWeight: 800 }}>Admin Analytics</h1>
          <p className="text-muted" style={{ fontWeight: 500, fontSize: 14 }}>Real-time data from tests, users, and career paths.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: emeraldHighlight, display: 'inline-block' }} />
          <span style={{ fontSize: 13, color: emeraldHighlight, fontWeight: 600 }}>System Active</span>
        </div>
      </div>

      <div className="bento-grid">

        {/* 3 Compact Stat Tiles */}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 4 }}>
          {[
            { label: 'Total Users', val: data.totUsers ?? 0, sub: 'Registered students', color: strokeColor },
            { label: 'Tests Taken', val: data.totTests ?? 0, sub: 'All aptitude tests', color: emeraldHighlight },
            { label: 'Avg Score', val: data.avgScoreOverall ? `${data.avgScoreOverall}%` : '0%', sub: 'Across all paths', color: isLight ? '#D97706' : '#fbbf24' }
          ].map((stat, i) => (
            <div key={i} className="glass-card" style={{ flex: '1 1 160px', textAlign: 'center', padding: '16px 14px', minWidth: 140 }}>
              <p className="text-muted" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>{stat.label}</p>
              <div style={{ fontSize: 28, fontWeight: 900, color: stat.color, letterSpacing: '-0.02em' }}>{stat.val}</div>
              <p className="text-muted" style={{ fontSize: 11, marginTop: 4 }}>{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Avg Score by Career Path */}
        <div className="glass-card col-span-12 lg:col-span-8">
          <h3 className="text-accent" style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Average Score by Career Path</h3>
          <p className="text-muted" style={{ fontSize: 13, marginBottom: 16 }}>Percentage score per path (higher = students performing better)</p>
          {pathStats.length === 0 ? (
            <p className="text-muted text-sm">No test data yet.</p>
          ) : (
            <div style={{ height: 260 }}>
              <Bar data={avgScoreData} options={{
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { max: 100, grid: { color: gridColor }, ticks: { color: tickColor, font: { size: 11 } } },
                  y: { grid: { display: false }, ticks: { color: labelColor, font: { size: 12, weight: 600 } } }
                }
              }} />
            </div>
          )}
        </div>

        {/* Users per Path Pie */}
        <div className="glass-card col-span-12 lg:col-span-4">
          <h3 className="text-accent" style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Users per Path</h3>
          <p className="text-muted" style={{ fontSize: 13, marginBottom: 16 }}>Distribution of student selections</p>
          {pathStats.every(p => p.userCount === 0) ? (
            <p className="text-muted text-sm">No path selections yet.</p>
          ) : (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Pie data={usersPerPathData} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'bottom', labels: { color: labelColor, font: { size: 11 }, padding: 12 } }
                }
              }} />
            </div>
          )}
        </div>

        {/* Top Weak Topics */}
        <div className="glass-card col-span-12 lg:col-span-4">
          <h3 className="text-accent" style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Top Weak Topics</h3>
          <p className="text-muted" style={{ fontSize: 13, marginBottom: 16 }}>Most commonly wrong questions across all tests</p>
          {topWeak.length === 0 ? (
            <p className="text-muted text-sm">No weak topic data yet.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {topWeak.map(([topic, count], i) => (
                <li key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 14, color: labelColor, fontWeight: 600 }}>
                    {i + 1}. {topic.charAt(0).toUpperCase() + topic.slice(1)}
                  </span>
                  <span style={{ padding: '3px 10px', borderRadius: 999, background: `${strokeColor}20`, color: strokeColor, fontSize: 12, fontWeight: 800 }}>
                    {count}x
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Path Performance Table */}
        <div className="glass-card col-span-12 lg:col-span-8">
          <h3 className="text-accent" style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Path Performance Summary</h3>
          <p className="text-muted" style={{ fontSize: 13, marginBottom: 16 }}>Students enrolled and average score per career path</p>
          {pathStats.length === 0 ? (
            <p className="text-muted text-sm">No career paths yet.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Career Path', 'Students', 'Avg Score'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--primary)', fontSize: 13, borderBottom: `1px solid ${isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)'}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pathStats.map((p, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.03)'}` }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: labelColor, fontSize: 14 }}>{p.name}</td>
                    <td style={{ padding: '10px 12px', color: tickColor, fontSize: 14 }}>{p.userCount}</td>
                    <td style={{ padding: '10px 12px', fontSize: 14 }}>
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

        {/* Latest Tests Table */}
        <div className="glass-card col-span-12" style={{ overflowX: 'auto' }}>
          <h3 className="text-accent" style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Latest Tests</h3>
          <p className="text-muted" style={{ fontSize: 13, marginBottom: 16 }}>Most recent 20 test submissions</p>
          {latestTests.length === 0 ? (
            <p className="text-muted text-sm">No tests taken yet.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
              <thead>
                <tr>
                  {['User', 'Career Path', 'Score', 'Weak Topics', 'Date'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--primary)', fontSize: 13, borderBottom: `1px solid ${isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)'}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {latestTests.map((t, i) => {
                  const pct = t.total > 0 ? Math.round((t.score / t.total) * 100) : 0;
                  return (
                    <tr key={i} style={{ borderBottom: `1px solid ${isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.03)'}` }}>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: labelColor, fontSize: 14 }}>{t.user?.name || '—'}</td>
                      <td style={{ padding: '10px 12px', color: tickColor, fontSize: 14 }}>{t.careerPath?.name || '—'}</td>
                      <td style={{ padding: '10px 12px', fontSize: 14 }}>
                        <span style={{ color: pct >= 70 ? emeraldHighlight : (pct >= 40 ? '#f59e0b' : '#ff6b6b'), fontWeight: 700 }}>
                          {t.score}/{t.total} ({pct}%)
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', color: tickColor, fontSize: 13, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {t.weakTopics || '—'}
                      </td>
                      <td style={{ padding: '10px 12px', color: tickColor, fontSize: 13 }}>
                        {new Date(t.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}
