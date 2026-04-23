import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const roles = [
  'Web Developer', 'Backend Developer', 'Full Stack Developer',
  'Data Analyst', 'Data Scientist', 'AI & ML Engineer', 'AI Prompt Engineer',
  'Software Engineer', 'Mobile App Developer', 'Game Developer',
  'Blockchain Developer', 'Cloud Engineer', 'DevOps Engineer',
  'Cyber Security Specialist', 'Network Engineer', 'Database Administrator',
  'UI/UX Designer', 'QA Tester', 'IoT Engineer', 'Robotics Engineer'
];
const difficulties = ['Beginner', 'Intermediate', 'Expert'];

export default function InterviewSelectPage() {
  const [role, setRole] = useState(roles[0]);
  const [difficulty, setDifficulty] = useState(difficulties[0]);
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const handleStart = (e) => {
    e.preventDefault();
    navigate(`/interview-live?role=${encodeURIComponent(role)}&difficulty=${encodeURIComponent(difficulty)}`);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ maxWidth: 500 }}>
        <h2 style={{ textAlign: 'center', color: 'var(--primary)', marginBottom: 6 }}>Start AI Interview</h2>
        <p style={{ textAlign: 'center', color: 'var(--on-surface-variant)', fontSize: 14, marginBottom: 28 }}>
          Choose a career path and difficulty level, then start answering AI-generated questions.
        </p>
        <form onSubmit={handleStart}>
          <label className="form-label" style={{ textAlign: 'left', marginBottom: 6, display: 'block' }}>Career Path</label>
          <select
            value={role}
            onChange={e => setRole(e.target.value)}
            className="auth-pill-input"
            style={{ marginBottom: 20, cursor: 'pointer', appearance: 'none',
              background: isLight ? 'rgba(17,28,45,0.06)' : 'rgba(255,255,255,0.06)',
              paddingRight: 16
            }}
          >
            {roles.map(r => (
              <option key={r} value={r} style={{ background: isLight ? '#fff' : '#0d1425', color: isLight ? '#111C2D' : '#dee5ff' }}>
                {r}
              </option>
            ))}
          </select>

          <label className="form-label" style={{ textAlign: 'left', marginBottom: 6, display: 'block' }}>Difficulty</label>
          <select
            value={difficulty}
            onChange={e => setDifficulty(e.target.value)}
            className="auth-pill-input"
            style={{ marginBottom: 28, cursor: 'pointer', appearance: 'none',
              background: isLight ? 'rgba(17,28,45,0.06)' : 'rgba(255,255,255,0.06)',
              paddingRight: 16
            }}
          >
            {difficulties.map(d => (
              <option key={d} value={d} style={{ background: isLight ? '#fff' : '#0d1425', color: isLight ? '#111C2D' : '#dee5ff' }}>
                {d}
              </option>
            ))}
          </select>

          <button type="submit" className="auth-submit-btn" style={{ width: '100%' }}>
            Start Interview
          </button>
        </form>
      </div>
    </div>
  );
}
