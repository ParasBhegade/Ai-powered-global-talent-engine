import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { useTheme } from '../context/ThemeContext';

export default function TestPage() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [pathId, setPathId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [flagged, setFlagged] = useState(new Set());
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  useEffect(() => { loadQuestions(); }, []);

  const loadQuestions = async () => {
    try {
      const profile = await apiFetch('/users/profile');
      const path = profile.user.selectedPath;
      if (!path) {
        alert('Please select a career path first.');
        navigate('/career-paths');
        return;
      }
      const pid = path._id || path;
      setPathId(pid);
      // Server returns adaptively-ordered questions (weak topics first)
      const data = await apiFetch(`/tests/questions/${pid}`);
      setQuestions(data.questions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Warn if unanswered
    const unanswered = questions.filter(q => !answers[q._id]);
    if (unanswered.length > 0) {
      if (!confirm(`You have ${unanswered.length} unanswered question(s). Submit anyway?`)) return;
    }
    try {
      const answerArray = questions.map(q => ({
        questionId: q._id,
        selected: answers[q._id] || ''
      }));
      const data = await apiFetch('/tests/submit', {
        method: 'POST',
        body: JSON.stringify({ careerPathId: pathId, answers: answerArray })
      });
      navigate(`/result/${data.scoreId}`);
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleFlag = (qId) => {
    setFlagged(prev => {
      const n = new Set(prev);
      if (n.has(qId)) n.delete(qId); else n.add(qId);
      return n;
    });
  };

  const goTo = (i) => setCurrent(i);
  const q = questions[current];
  const total = questions.length;
  const answered = Object.keys(answers).length;

  const strokeColor = isLight ? '#4648D4' : '#c0c1ff';
  const emeraldHighlight = isLight ? '#006C49' : '#4edea2';
  const surfaceHigh = isLight ? '#EBF0FA' : '#222a3d';
  const labelColor = isLight ? '#111C2D' : '#dee5ff';

  if (loading) return <div className="loading-screen">Loading test…</div>;
  if (!questions.length) return (
    <div className="page-container text-center">
      <h2 className="text-accent">No questions available for this career path yet.</h2>
      <p className="text-muted mt-4">Ask your admin to add aptitude questions for this path.</p>
    </div>
  );

  return (
    <div className="page-container" style={{ maxWidth: 900 }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-accent" style={{ fontSize: 24, fontWeight: 800 }}>Aptitude Test</h2>
          <p className="text-muted" style={{ fontSize: 14, marginTop: 2 }}>
            Answered: <strong style={{ color: answered === total ? emeraldHighlight : labelColor }}>{answered}</strong> / {total}
            {answered === total && <span style={{ color: emeraldHighlight, marginLeft: 8 }}>✓ All answered</span>}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: strokeColor }}>Q{current + 1} / {total}</div>
          <div className="text-muted" style={{ fontSize: 13 }}>Use navigation below to jump</div>
        </div>
      </div>

      {/* Question Nav */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
        {questions.map((q, i) => {
          const isAns = !!answers[q._id];
          const isCur = i === current;
          const isFlagged = flagged.has(q._id);
          return (
            <button
              key={i}
              onClick={() => goTo(i)}
              style={{
                width: 36, height: 36, borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13,
                background: isCur
                  ? `linear-gradient(135deg, ${strokeColor}, ${emeraldHighlight})`
                  : isAns
                    ? (isLight ? 'rgba(0,108,73,0.15)' : 'rgba(78,222,162,0.15)')
                    : surfaceHigh,
                color: isCur ? '#fff' : isAns ? emeraldHighlight : labelColor,
                outline: isFlagged ? `2px solid #f59e0b` : isCur ? 'none' : 'none',
                transition: 'all 0.15s'
              }}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      {/* Question Card */}
      {q && (
        <div className="glass-card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: labelColor, lineHeight: 1.5, flex: 1, paddingRight: 16 }}>
              {current + 1}. {q.question}
            </h3>
            <button
              onClick={() => toggleFlag(q._id)}
              title="Flag for review"
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: flagged.has(q._id) ? '#f59e0b' : (isLight ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)'), flexShrink: 0 }}
            >
              🚩
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {['A', 'B', 'C', 'D'].map(opt => {
              const optText = q[`option${opt}`];
              if (!optText) return null;
              const isSelected = answers[q._id] === opt;
              return (
                <label
                  key={opt}
                  style={{
                    display: 'flex', gap: 12, alignItems: 'center', padding: '12px 14px', borderRadius: 10,
                    background: isSelected
                      ? (isLight ? 'rgba(70,72,212,0.12)' : 'rgba(192,193,255,0.1)')
                      : surfaceHigh,
                    border: `1px solid ${isSelected ? strokeColor : (isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.04)')}`,
                    cursor: 'pointer', transition: 'all 0.15s', color: labelColor, fontSize: 15, fontWeight: isSelected ? 700 : 400
                  }}
                >
                  <input
                    type="radio"
                    name={q._id}
                    value={opt}
                    checked={isSelected}
                    onChange={() => setAnswers(prev => ({ ...prev, [q._id]: opt }))}
                    style={{ accentColor: strokeColor, width: 16, height: 16, flexShrink: 0 }}
                  />
                  <span style={{ fontWeight: 700, color: strokeColor, minWidth: 20 }}>{opt}.</span>
                  {optText}
                </label>
              );
            })}
          </div>

          {/* Prev / Next buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20, gap: 10 }}>
            <button
              onClick={() => setCurrent(c => Math.max(0, c - 1))}
              disabled={current === 0}
              className="btn-cta-outline"
              style={{ opacity: current === 0 ? 0.4 : 1, fontSize: 14 }}
            >
              ← Previous
            </button>
            {current < total - 1 ? (
              <button onClick={() => setCurrent(c => c + 1)} className="btn-cta" style={{ fontSize: 14 }}>
                Next →
              </button>
            ) : (
              <button onClick={handleSubmit} className="btn-cta" style={{ fontSize: 14, background: `linear-gradient(135deg, ${emeraldHighlight}, #00eaff)`, color: '#001' }}>
                ✅ Submit Test
              </button>
            )}
          </div>
        </div>
      )}

      {/* Submit all at any time */}
      {answered === total && (
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <button onClick={handleSubmit} className="btn-cta" style={{ fontSize: 16, padding: '12px 32px' }}>
            ✅ Submit All Answers
          </button>
        </div>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 16, fontSize: 13, color: 'var(--on-surface-variant)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 14, height: 14, borderRadius: 4, background: `linear-gradient(135deg, ${strokeColor}, ${emeraldHighlight})` }} /> Current
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 14, height: 14, borderRadius: 4, background: isLight ? 'rgba(0,108,73,0.15)' : 'rgba(78,222,162,0.15)', border: `1px solid ${emeraldHighlight}` }} /> Answered
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 14, height: 14, borderRadius: 4, background: surfaceHigh }} /> Not answered
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 14, height: 14, borderRadius: 4, background: surfaceHigh, outline: '2px solid #f59e0b' }} /> 🚩 Flagged
        </span>
      </div>
    </div>
  );
}
