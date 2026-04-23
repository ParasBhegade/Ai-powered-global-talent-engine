import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../utils/api';

export default function SkillsPage() {
  const [skills, setSkills] = useState([]);
  const [career, setCareer] = useState(null);

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      const profileData = await apiFetch('/users/profile');
      const path = profileData.user.selectedPath;
      if (!path) return;
      setCareer(path);
      const skillData = await apiFetch(`/careers/${path._id}/skills`);
      setSkills(skillData.skills || []);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-container text-center">
      <h1 className="text-accent" style={{ fontSize: 32 }}>
        Required Skills for: {career?.name || 'Career Path'}
      </h1>
      <p className="text-muted mt-4">These are essential skills to become a strong {career?.name || 'professional'}.</p>

      <Link to="/test"><button className="btn-cta mt-6">Start Aptitude Test</button></Link>

      <div className="cards-grid" style={{ marginTop: 30 }}>
        {skills.length === 0 ? (
          <p style={{ gridColumn: '1 / -1', color: 'var(--error)' }}>No skills found.</p>
        ) : skills.map(s => (
          <div className="path-card" key={s._id}>
            <div className="text-accent font-bold" style={{ fontSize: 20 }}>{s.skillName}</div>
            <div style={{ color: 'var(--tertiary)', fontSize: 14, marginTop: 5 }}>Category: {s.category}</div>
            <div style={{ color: 'var(--secondary)', fontSize: 14, marginTop: 10 }}>Importance: {s.weight}</div>
          </div>
        ))}
      </div>

      <Link to="/career-paths" className="text-accent" style={{ display: 'block', marginTop: 20 }}>
        ← Choose another path
      </Link>
    </div>
  );
}
