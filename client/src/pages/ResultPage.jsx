import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Radar, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { apiFetch } from '../utils/api';
import { useTheme } from '../context/ThemeContext';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function ResultPage() {
  const { id } = useParams();
  const { theme } = useTheme();
  const [result, setResult] = useState(null);
  const [skills, setSkills] = useState([]);

  useEffect(() => { loadResult(); }, [id]);

  const loadResult = async () => {
    try {
      const data = id ? await apiFetch(`/tests/results/${id}`) : await apiFetch('/tests/results').then(d => ({ result: d.results?.[0], skills: [] }));
      setResult(data.result);
      if (data.skills) setSkills(data.skills);
      else if (data.result?.careerPath) {
        const s = await apiFetch(`/careers/${data.result.careerPath._id || data.result.careerPath}/skills`);
        setSkills(s.skills || []);
      }
    } catch (err) { console.error(err); }
  };

  if (!result) return <div className="loading-screen">Loading results...</div>;

  const percent = result.total > 0 ? Math.round((result.score / result.total) * 1000) / 10 : 0;
  const weakTopics = result.weakTopics ? result.weakTopics.split(',').map(s => s.trim()).filter(Boolean) : [];
  const skillNames = skills.length ? skills.map(s => s.skillName) : ['Fundamentals', 'Practical', 'Problem Solving'];
  const skillValues = skills.length ? skills.map(s => Math.min(100, s.weight)) : [60, 50, 40];
  const careerName = result.careerPath?.name || 'Career Path';
  const pathId = result.careerPath?._id || result.careerPath;

  const isLight = theme === 'light';
  const tickColor = isLight ? '#4B5563' : '#a3aac4';
  const labelColor = isLight ? '#111C2D' : '#dee5ff';
  const emeraldColor = isLight ? 'rgba(0,108,73,0.92)' : 'rgba(105,246,184,0.92)';
  const indigoColor = isLight ? 'rgba(70,72,212,0.92)' : 'rgba(163,166,255,0.92)';

  return (
    <div className="page-container">
      <div className="flex justify-between items-center" style={{ marginBottom: 14 }}>
        <div className="flex items-center gap-3">
          <div className="logo-icon">AI</div>
          <div>
            <div className="text-accent font-bold" style={{ fontSize: 18 }}>AI Talent Engine — Result</div>
            <div className="text-muted text-sm">{careerName} · Score: <strong>{result.score}/{result.total}</strong> · {percent}%</div>
          </div>
        </div>
        <div className="flex gap-3">
          <Link to="/dashboard" className="btn-cta" style={{ fontSize: 14, padding: '8px 14px' }}>⬅ Back</Link>
          <Link to={`/recommendations?path=${pathId}&score=${result.score}&total=${result.total}`} className="btn-cta" style={{ fontSize: 14, padding: '8px 14px' }}>🔥 AI Recommendations</Link>
        </div>
      </div>

      <div className="two-col">
        <div>
          <div className="glass-card" style={{ marginBottom: 18 }}>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-accent font-black">Test Summary</div>
                <div className="text-muted mt-4 text-sm">Completed: {new Date(result.createdAt).toLocaleString()}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="text-sm text-muted font-bold">Career Path</div>
                <div className="font-black">{careerName}</div>
              </div>
            </div>
            <div className="flex gap-3 items-center mt-4">
              <div className="score-ring">
                <div style={{ textAlign: 'center' }}>
                  <div className="score-num">{result.score} / {result.total}</div>
                  <div className="score-percent">{percent}%</div>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div className="text-accent font-bold">Weak topics detected</div>
                <div className="bubbles">
                  {weakTopics.length ? weakTopics.map((w, i) => <div className="bubble" key={i}>{w}</div>) : <div className="bubble">None — great!</div>}
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ marginBottom: 18 }}>
            <div className="text-accent font-bold mb-4">Visual Insights</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ position: 'relative', height: '250px', display: 'flex', justifyContent: 'center' }}>
                <Radar data={{
                  labels: skillNames,
                  datasets: [{ label: 'Skill Strength', data: skillValues, backgroundColor: isLight ? 'rgba(70,72,212,0.12)' : 'rgba(163,166,255,0.12)', borderColor: isLight ? 'var(--primary)' : '#a3a6ff', borderWidth: 2, pointBackgroundColor: isLight ? 'var(--secondary)' : '#69f6b8' }]
                }} options={{ responsive: true, maintainAspectRatio: false, scales: { r: { ticks: { color: tickColor, backdropColor: 'transparent' }, pointLabels: { color: labelColor } } }, plugins: { legend: { display: false } } }} />
              </div>
              <div style={{ position: 'relative', height: '250px' }}>
                <Bar data={{
                  labels: [...skillNames].reverse(),
                  datasets: [{ label: 'Priority', data: [...skillValues].reverse(), backgroundColor: skillNames.map((_, i) => i % 2 ? indigoColor : emeraldColor), borderRadius: 8, barThickness: 18 }]
                }} options={{ indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: tickColor }, max: 100 }, y: { ticks: { color: labelColor } } } }} />
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="glass-card" style={{ marginBottom: 18 }}>
            <div className="text-accent font-bold mb-4">Quick Summary</div>
            <div className="flex justify-between">
              <div className="text-muted font-bold">Score</div>
              <div className="font-black">{result.score}/{result.total} ({percent}%)</div>
            </div>
            <div className="progress-bar-bg mt-4">
              <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
            </div>
            <div className="mt-6">
              <div className="text-accent font-bold mb-4">Top Focus Areas</div>
              {skills.slice(0, 5).map(s => (
                <div className="skill-row" key={s._id}>
                  <div className="skill-name">{s.skillName}</div>
                  <div className="skill-bar"><div className="skill-fill" style={{ width: `${s.weight}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-card">
            <div className="text-accent font-bold">Fast Tips</div>
            <ul style={{ marginTop: 8, color: 'var(--on-surface)' }}>
              <li>Practice 30-min daily on a single weak skill.</li>
              <li>Ship small projects & document them.</li>
              <li>Re-take test after 2 weeks to measure improvement.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
