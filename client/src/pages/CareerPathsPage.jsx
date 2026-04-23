import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';

export default function CareerPathsPage() {
  const [paths, setPaths] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    apiFetch('/careers').then(d => setPaths(d.careers)).catch(console.error);
  }, []);

  const choosePath = async (pathId) => {
    try {
      await apiFetch('/users/select-path', {
        method: 'PUT',
        body: JSON.stringify({ pathId })
      });
      navigate('/skills');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="page-container">
      <h1 className="text-center text-accent" style={{ fontSize: 36, marginBottom: 32, fontWeight: 800 }}>
        Select Your Career Path
      </h1>
      <div className="cards-grid">
        {paths.map(p => (
          <div className="path-card" key={p._id}>
            <h3>{p.name}</h3>
            <p>{p.description}</p>
            <button className="btn-cta" style={{ width: '100%', marginTop: 12 }} onClick={() => choosePath(p._id)}>
              Choose Path
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
