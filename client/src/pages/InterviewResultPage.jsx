import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { useTheme } from '../context/ThemeContext';

export default function InterviewResultPage() {
  const { sessionId } = useParams();
  const { theme } = useTheme();
  const [data, setData] = useState(null);

  useEffect(() => {
    apiFetch(`/interviews/results/${sessionId}`).then(setData).catch(console.error);
  }, [sessionId]);

  if (!data) return <div className="loading-screen">Loading results...</div>;

  const { rows, avg, level } = data;
  const percent = Math.round((avg / 10) * 360);
  const isLight = theme === 'light';
  const ringColor = isLight ? 'var(--primary)' : '#00eaff';
  const ringBg = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(58,58,126,0.5)';

  return (
    <div className="page-container" style={{ maxWidth: 900 }}>
      <div className="glass-card mb-4">
        <h2 className="text-accent">📊 Interview Summary</h2>
        <p>Session ID: <strong>{sessionId}</strong></p>
        <span className="btn-cta" style={{ display: 'inline-block', marginTop: 8, padding: '8px 15px', fontSize: 14 }}>{level}</span>

        <div className="text-center mt-6">
          <div className="score-circle" style={{ background: `conic-gradient(${ringColor} ${percent}deg, ${ringBg} 0deg)` }}>
            <div className="score-inner">{avg}/10</div>
          </div>
          <div className="mt-4 text-muted font-bold">
            Overall Score: {avg}/10 ({Math.round((avg / 10) * 100)}%)
          </div>
        </div>
      </div>

      <div className="glass-card mb-4">
        <h3 className="text-accent mb-4">📝 Detailed Evaluation</h3>
        {rows.map((r, i) => (
          <div key={i} className="question-card" style={{ marginBottom: 14 }}>
            <strong>Q:</strong> {r.question}<br /><br />
            <strong>Your Answer:</strong><br />{r.userAnswer}<br /><br />
            <strong>AI Feedback:</strong><br />{r.aiFeedback}<br /><br />
            <strong>Score:</strong> <span className="text-accent font-bold">{r.aiScore}/10</span>
          </div>
        ))}
      </div>

      <div className="glass-card mb-4">
        <h3 className="text-accent">📈 Tips to Improve</h3>
        <ul style={{ marginTop: 8, color: 'var(--on-surface)' }}>
          <li>Follow the AI feedback for each question.</li>
          <li>Give structured answers (Intro → Explanation → Example → Result).</li>
          <li>Practice again for better accuracy.</li>
        </ul>
      </div>

      <div className="text-center mt-6 flex gap-3 justify-between" style={{ justifyContent: 'center' }}>
        <Link to="/interview-select" className="btn-cta">Start New Interview</Link>
        <Link to="/dashboard" className="btn-cta-outline">🔙 Back to Dashboard</Link>
      </div>
    </div>
  );
}
