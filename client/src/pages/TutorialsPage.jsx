import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { apiFetch } from '../utils/api';

function extractYT(url) {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/))([\w-]{11})/i);
  return m ? m[1] : '';
}

export default function TutorialsPage() {
  const [params] = useSearchParams();
  const pathId = params.get('path');
  const [tutorials, setTutorials] = useState([]);
  const [careerName, setCareerName] = useState('');

  useEffect(() => { load(); }, [pathId]);

  const load = async () => {
    try {
      let id = pathId;
      if (!id) {
        const p = await apiFetch('/users/profile');
        id = p.user.selectedPath?._id;
      }
      if (!id) return;
      const c = await apiFetch(`/careers/${id}`);
      setCareerName(c.career?.name || '');
      const d = await apiFetch(`/tutorials/${id}`);
      setTutorials(d.tutorials || []);
    } catch { }
  };

  return (
    <div className="page-container">
      <Link to="/dashboard" className="btn-cta" style={{ marginBottom: 20, display: 'inline-flex', alignItems: 'center', gap: '8px' }}><img src="/icons/back.png" alt="Back" style={{ width: 14, height: 14 }} /> Back</Link>
      <h1 className="text-center text-accent" style={{ marginTop: 20 }}>🎓 {careerName} — Tutorials</h1>
      {tutorials.length === 0 ? (
        <p className="text-center mt-6 text-muted">No tutorials found.</p>
      ) : (
        <div className="cards-grid">
          {tutorials.map(t => {
            const vid = extractYT(t.url);
            return (
              <div className="tutorial-card" key={t._id}>
                <h2 style={{ fontSize: 18, marginBottom: 8, color: 'var(--primary)' }}>{t.title}</h2>
                <p style={{ fontSize: 14, color: 'var(--on-surface-variant)', marginBottom: 16 }}>{t.summary}</p>
                {vid ? (
                  <iframe src={`https://www.youtube.com/embed/${vid}`} style={{ width: '100%', height: '220px', borderRadius: '12px', border: 'none' }} allowFullScreen title={t.title} />
                ) : (
                  <p style={{ color: '#ff6e84' }}>Invalid URL</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
