import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Radar, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js';
import { apiFetch } from '../utils/api';
import { useTheme } from '../context/ThemeContext';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, CategoryScale, LinearScale, BarElement, Tooltip);

// ─── TTS Hook ─────────────────────────────────────────────────────────────────
function useTTS() {
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(0);
  const [rate, setRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [status, setStatus] = useState('');
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const queueRef = useRef([]);

  useEffect(() => {
    const load = () => {
      const v = speechSynthesis.getVoices();
      setVoices(v);
    };
    speechSynthesis.onvoiceschanged = load;
    load();
    // Spacebar shortcut
    const onKey = (e) => {
      const tag = (document.activeElement || {}).tagName || '';
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(tag)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        if (!speechSynthesis.speaking) document.getElementById('tts-play-btn')?.click();
        else if (speechSynthesis.paused) speechSynthesis.resume();
        else speechSynthesis.pause();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Fix stale closures by storing mutable values in refs
  const voicesRef = useRef([]);
  const selectedVoiceRef = useRef(0);
  const rateRef = useRef(1.0);
  const pitchRef = useRef(1.0);

  useEffect(() => { voicesRef.current = voices; }, [voices]);
  useEffect(() => { selectedVoiceRef.current = selectedVoice; }, [selectedVoice]);
  useEffect(() => { rateRef.current = rate; }, [rate]);
  useEffect(() => { pitchRef.current = pitch; }, [pitch]);

  const speakQueue = useCallback((items) => {
    speechSynthesis.cancel();
    if (!items.length) return;
    queueRef.current = [...items];

    const speakNext = () => {
      if (!queueRef.current.length) {
        setStatus('Finished reading.');
        setPlaying(false);
        return;
      }
      const { el, text } = queueRef.current.shift();
      const utter = new SpeechSynthesisUtterance(text);
      // Always read fresh values from refs (no stale closure)
      if (voicesRef.current[selectedVoiceRef.current]) utter.voice = voicesRef.current[selectedVoiceRef.current];
      utter.rate = rateRef.current;
      utter.pitch = pitchRef.current;
      if (el) {
        el.style.background = 'rgba(255,255,255,0.06)';
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      utter.onend = () => {
        if (el) el.style.background = '';
        setTimeout(speakNext, 180);
      };
      utter.onerror = () => {
        setStatus('TTS error.');
        setPlaying(false);
      };
      speechSynthesis.speak(utter);
      setStatus('Reading…');
      setPlaying(true);
      setPaused(false);
    };
    speakNext();
  }, []);

  const pause = () => {
    speechSynthesis.pause();
    setPaused(true);
    setStatus('Paused');
  };

  const resume_ = () => {
    speechSynthesis.resume();
    setPaused(false);
    setStatus('Resumed');
  };

  const stop = () => {
    speechSynthesis.cancel();
    queueRef.current = [];
    setPlaying(false);
    setPaused(false);
    setStatus('Stopped');
  };

  return { voices, selectedVoice, setSelectedVoice, rate, setRate, pitch, setPitch, status, playing, paused, speakQueue, pause, resume: resume_, stop };
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function RecommendationsPage() {
  const [searchParams] = useSearchParams();
  const { theme } = useTheme();
  const [ai, setAi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [careerName, setCareerName] = useState('Career Path');
  const [pathId, setPathId] = useState(null);

  const pId = searchParams.get('path');
  const score = parseInt(searchParams.get('score') || '0');
  const total = parseInt(searchParams.get('total') || '0');
  const percent = total > 0 ? Math.round((score / total) * 100) : 0;

  const tts = useTTS();
  const summaryRef = useRef(null);
  const improvRef = useRef([]);
  const roadmapRef = useRef([]);
  const projectsRef = useRef([]);

  useEffect(() => { loadRecommendations(); }, []);

  const loadRecommendations = async () => {
    try {
      let skills = [];
      let name = 'Career Path';
      let id = pId;
      let resolvedScore = score;
      let resolvedTotal = total;

      // Fetch user profile for path
      const pd = await apiFetch('/users/profile');
      if (!id) id = pd.user?.selectedPath?._id || pd.user?.selectedPath;

      // If no score in URL params, load from latest test history
      if (resolvedScore === 0 && resolvedTotal === 0) {
        try {
          const scoreData = await apiFetch('/tests/results');
          if (scoreData.results?.length > 0) {
            resolvedScore = scoreData.results[0].score || 0;
            resolvedTotal = scoreData.results[0].total || 0;
          }
        } catch { }
      }

      if (id) {
        setPathId(id);
        const careerData = await apiFetch(`/careers/${id}`);
        name = careerData.career?.name || name;
        setCareerName(name);
        const skillData = await apiFetch(`/careers/${id}/skills`);
        skills = (skillData.skills || []).map(s => s.skillName);
      }

      const data = await apiFetch('/ai/recommendations', {
        method: 'POST',
        body: JSON.stringify({ careerName: name, score: resolvedScore, total: resolvedTotal, skillList: skills })
      });
      setAi(data.ai);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const playAll = () => {
    const items = [];
    if (summaryRef.current) items.push({ el: summaryRef.current, text: summaryRef.current.textContent });
    improvRef.current.forEach(el => { if (el) items.push({ el, text: el.textContent }); });
    roadmapRef.current.forEach(el => { if (el) items.push({ el, text: el.textContent }); });
    projectsRef.current.forEach(el => { if (el) items.push({ el, text: el.textContent }); });
    tts.speakQueue(items);
  };

  if (loading) return <div className="loading-screen text-accent font-black">Generating AI Recommendations…</div>;
  if (!ai) return <div className="page-container"><h2 className="text-accent">Failed to load recommendations.</h2></div>;

  const weakDataObj = ai.weak_skills || {};
  const prioDataObj = ai.learning_priority || {};
  const weakLabels = Object.keys(weakDataObj).length ? Object.keys(weakDataObj) : ['Fundamentals', 'Syntax', 'Problem Solving'];
  const weakValues = Object.values(weakDataObj).length ? Object.values(weakDataObj) : [60, 70, 50];
  const prioLabels = Object.keys(prioDataObj).length ? Object.keys(prioDataObj) : ['Core Concepts', 'Advanced Patterns', 'Projects'];
  const prioValues = Object.values(prioDataObj).length ? Object.values(prioDataObj).map(Number) : [80, 90, 70];
  const topFocus = Object.entries(ai.learning_priority || {}).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const roadmap = ai.roadmap || [];
  const projects = ai.projects || [];

  const isLight = theme === 'light';
  const strokeColor = isLight ? '#4648D4' : '#c0c1ff';
  const emeraldHighlight = isLight ? '#006C49' : '#4edea2';
  const surfaceHigh = isLight ? '#EBF0FA' : '#222a3d';
  const tickColor = isLight ? '#4B5563' : '#908fa0';
  const labelColor = isLight ? '#111C2D' : '#dee5ff';
  const chartEmerald = isLight ? 'rgba(0,108,73,0.92)' : 'rgba(78,222,162,0.92)';
  const chartIndigo = isLight ? 'rgba(70,72,212,0.92)' : 'rgba(192,193,255,0.92)';

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-accent" style={{ fontSize: '32px', letterSpacing: '-0.02em', fontWeight: 800, marginBottom: 8 }}>
            AI Recommendations
          </h1>
          <p className="text-muted" style={{ fontWeight: 600, maxWidth: 500 }}>
            Career: <span style={{ color: strokeColor }}>{careerName}</span>
            {total > 0 && <> — Score: <strong>{score}/{total} ({percent}%)</strong></>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass-card flex items-center gap-2" style={{ padding: '8px 16px', borderRadius: 12 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: percent >= 70 ? emeraldHighlight : '#ff6e84' }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: labelColor }}>
              {total > 0 ? `${score}/${total}` : 'No test taken'}
            </span>
          </div>
          <Link to="/dashboard" className="btn-cta-outline" style={{ padding: '8px 16px', fontSize: 14 }}>← Dashboard</Link>
        </div>
      </div>

      {/* 2-column layout like old PHP */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 22, alignItems: 'start' }} className="recs-grid">

        {/* ── Left: Main Column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Performance Summary + TTS Controls */}
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <h3 className="text-accent" style={{ fontSize: 18, fontWeight: 800 }}>Performance Summary</h3>
                <p className="text-muted" style={{ fontSize: 13, marginTop: 2 }}>AI-generated assessment and action plan</p>
              </div>
            </div>

            <p ref={summaryRef} style={{ fontSize: 15, lineHeight: 1.7, color: isLight ? '#111C2D' : '#dff7ff', marginBottom: 16 }}>
              {ai.summary}
            </p>

            {/* Full TTS Controls */}
            <div style={{ padding: '14px 16px', borderRadius: 12, background: surfaceHigh, border: `1px solid ${isLight ? 'rgba(17,28,45,0.08)' : 'rgba(255,255,255,0.04)'}` }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 12 }}>
                <button
                  id="tts-play-btn"
                  onClick={playAll}
                  style={{ padding: '7px 18px', borderRadius: 8, fontWeight: 800, fontSize: 13, background: '#fff', color: '#111', border: '1px solid rgba(0,0,0,0.12)', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                >
                  Listen
                </button>
                <button
                  onClick={tts.pause}
                  style={{ padding: '7px 12px', borderRadius: 8, fontWeight: 700, fontSize: 13, background: surfaceHigh, color: labelColor, border: `1px solid ${isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.1)'}`, cursor: 'pointer' }}
                >
                  Pause
                </button>
                <button
                  onClick={tts.resume}
                  style={{ padding: '7px 12px', borderRadius: 8, fontWeight: 700, fontSize: 13, background: surfaceHigh, color: labelColor, border: `1px solid ${isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.1)'}`, cursor: 'pointer' }}
                >
                  Resume
                </button>
                <button
                  onClick={tts.stop}
                  disabled={!tts.playing && !tts.paused}
                  style={{ padding: '7px 12px', borderRadius: 8, fontWeight: 700, fontSize: 13, background: surfaceHigh, color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.3)', cursor: 'pointer', opacity: (!tts.playing && !tts.paused) ? 0.5 : 1 }}
                >
                  ⏹ Stop
                </button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
                {/* Voice selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: tickColor }}>Voice</span>
                  <select
                    value={tts.selectedVoice}
                    onChange={e => tts.setSelectedVoice(Number(e.target.value))}
                    style={{ background: isLight ? '#fff' : '#0e1a33', color: isLight ? '#111C2D' : '#d7e9ff', border: `1px solid ${isLight ? 'rgba(0,0,0,0.1)' : '#00eaff'}`, padding: '5px 10px', borderRadius: 8, fontSize: 13, maxWidth: 200 }}
                  >
                    {tts.voices.length === 0 ? (
                      <option>Loading voices…</option>
                    ) : (
                      tts.voices.map((v, i) => (
                        <option key={i} value={i}>{v.name} — {v.lang}</option>
                      ))
                    )}
                  </select>
                </div>

                {/* Rate slider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: tickColor }}>Speed {tts.rate.toFixed(1)}x</span>
                  <input type="range" min="0.5" max="2.0" step="0.1" value={tts.rate} onChange={e => tts.setRate(Number(e.target.value))} style={{ width: 80 }} />
                </div>

                {/* Pitch slider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: tickColor }}>Pitch {tts.pitch.toFixed(1)}</span>
                  <input type="range" min="0.5" max="2.0" step="0.1" value={tts.pitch} onChange={e => tts.setPitch(Number(e.target.value))} style={{ width: 80 }} />
                </div>
              </div>

              {tts.status && (
                <div style={{ marginTop: 8, fontSize: 13, color: isLight ? '#006C49' : '#4edea2', fontWeight: 600 }}>{tts.status}</div>
              )}
              <div style={{ marginTop: 6, fontSize: 12, color: tickColor }}>💡 Press <kbd style={{ padding: '1px 5px', borderRadius: 4, background: surfaceHigh, border: `1px solid ${isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.1)'}` }}>Space</kbd> to play/pause</div>
            </div>
          </div>

          {/* What to Improve */}
          <div className="glass-card">
            <h3 className="text-accent" style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>What to Improve</h3>
            <p className="text-muted" style={{ fontSize: 13, marginBottom: 16 }}>AI-prioritized points to focus on</p>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {(ai.improvement_points || []).map((pt, i) => (
                <li key={i} ref={el => improvRef.current[i] = el} style={{ margin: '10px 0', fontSize: 14, color: isLight ? '#111C2D' : '#dffaff', lineHeight: 1.6 }}>
                  {pt}
                </li>
              ))}
            </ul>
          </div>

          {/* Visual Insights: Radar + Bar */}
          <div className="glass-card">
            <h3 className="text-accent" style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Visual Insights</h3>
            <p className="text-muted" style={{ fontSize: 13, marginBottom: 16 }}>Weak skills, learning priorities</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: strokeColor, marginBottom: 8 }}>Weak Skills (Radar)</p>
                <div style={{ height: 280 }}>
                  <Radar data={{
                    labels: weakLabels,
                    datasets: [{
                      label: 'Weak Skills',
                      data: weakValues,
                      backgroundColor: isLight ? 'rgba(70,72,212,0.12)' : 'rgba(0,234,255,0.12)',
                      borderColor: strokeColor,
                      borderWidth: 2,
                      pointBackgroundColor: emeraldHighlight
                    }]
                  }} options={{
                    responsive: true, maintainAspectRatio: false,
                    scales: {
                      r: {
                        ticks: { color: tickColor, backdropColor: 'transparent', beginAtZero: true },
                        pointLabels: { color: labelColor, font: { size: 11 } },
                        grid: { color: isLight ? 'rgba(17,28,45,0.1)' : 'rgba(255,255,255,0.06)' },
                        angleLines: { color: isLight ? 'rgba(17,28,45,0.1)' : 'rgba(255,255,255,0.06)' }
                      }
                    },
                    plugins: { legend: { display: false } }
                  }} />
                </div>
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: strokeColor, marginBottom: 8 }}>Learning Priority (Bar)</p>
                <div style={{ height: 280 }}>
                  <Bar data={{
                    labels: prioLabels,
                    datasets: [{
                      label: 'Priority',
                      data: prioValues,
                      backgroundColor: prioLabels.map((_, i) => i % 2 ? chartIndigo : chartEmerald),
                      borderRadius: 8,
                      barThickness: 18
                    }]
                  }} options={{
                    indexAxis: 'y', responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      x: { ticks: { color: tickColor }, beginAtZero: true, max: 100, grid: { color: isLight ? 'rgba(17,28,45,0.05)' : 'rgba(255,255,255,0.05)' } },
                      y: { ticks: { color: labelColor, font: { size: 11 } }, grid: { display: false } }
                    }
                  }} />
                </div>
              </div>
            </div>

            {/* 30-day roadmap */}
            <div style={{ marginTop: 20 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: strokeColor, marginBottom: 12 }}>30-Day Roadmap</p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {roadmap.map((r, i) => (
                  <div key={i} ref={el => roadmapRef.current[i] = el}
                    style={{ flex: '1 1 200px', padding: 14, borderRadius: 10, background: surfaceHigh, border: `1px solid ${isLight ? 'rgba(17,28,45,0.06)' : 'rgba(255,255,255,0.04)'}`, color: isLight ? '#111C2D' : '#dffaff', fontSize: 14, lineHeight: 1.5 }}>
                    <strong style={{ color: strokeColor }}>{`Week ${i + 1}:`}</strong> {r}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Projects */}
          <div className="glass-card">
            <h3 className="text-accent" style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Mini Projects (AI Suggested)</h3>
            <p className="text-muted" style={{ fontSize: 13, marginBottom: 14 }}>Hands-on projects to apply your learning</p>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {projects.map((p, i) => (
                <li key={i} ref={el => projectsRef.current[i] = el} style={{ margin: '10px 0', fontSize: 14, color: isLight ? '#111C2D' : '#dffaff', lineHeight: 1.6 }}>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Right: Sidebar Summary ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Quick Summary */}
          <div className="glass-card">
            <div style={{ fontWeight: 900, color: 'var(--primary)', fontSize: 16, marginBottom: 4 }}>Quick Summary</div>
            <div className="text-muted" style={{ fontSize: 13, marginBottom: 16 }}>Snapshot & top focus areas</div>

            {total > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span className="text-muted" style={{ fontSize: 13 }}>Score</span>
                  <span style={{ fontWeight: 900, fontSize: 14 }}>{score}/{total} ({percent}%)</span>
                </div>
                <div style={{ height: 10, background: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.06)', borderRadius: 8, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(100, percent)}%`, background: `linear-gradient(90deg, ${strokeColor}, ${emeraldHighlight})`, transition: 'width 900ms ease' }} />
                </div>
              </div>
            )}

            <div style={{ marginBottom: 4, fontWeight: 800, color: 'var(--primary)', fontSize: 14 }}>Top Focus Areas</div>
            {topFocus.map(([skill, val], i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', margin: '10px 0' }}>
                <div style={{ width: 130, color: isLight ? '#111C2D' : '#cfefff', fontWeight: 600, fontSize: 13 }}>{skill}</div>
                <div style={{ flex: 1, height: 12, background: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.max(6, Math.min(100, Number(val)))}%`,
                    background: `linear-gradient(90deg, ${strokeColor}, ${emeraldHighlight})`,
                    borderRadius: 999,
                    transition: 'width 800ms ease'
                  }} />
                </div>
              </div>
            ))}

            <div style={{ marginTop: 20, fontWeight: 800, color: 'var(--primary)', fontSize: 14, marginBottom: 10 }}>Fast Tips</div>
            <ul style={{ paddingLeft: 18, margin: 0 }}>
              <li style={{ fontSize: 13, color: isLight ? '#111C2D' : '#dffaff', marginBottom: 6 }}>Practice 30-min daily on one weak skill.</li>
              <li style={{ fontSize: 13, color: isLight ? '#111C2D' : '#dffaff', marginBottom: 6 }}>Build & ship small projects weekly.</li>
              <li style={{ fontSize: 13, color: isLight ? '#111C2D' : '#dffaff' }}>Document your work (README & demo).</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="glass-card">
            <div style={{ fontWeight: 800, color: 'var(--primary)', marginBottom: 12 }}>Actions</div>
            {pathId && (
              <Link to={`/tutorials?path=${pathId}`} className="btn-cta" style={{ display: 'block', textAlign: 'center', marginBottom: 10, textDecoration: 'none' }}>
                📚 View Tutorials
              </Link>
            )}
            <Link to="/test" className="btn-cta-outline" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
              🔄 Retake Test
            </Link>
          </div>
        </div>
      </div>

      {/* Responsive CSS for sidebar */}
      <style>{`
        @media (max-width: 900px) {
          .recs-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
