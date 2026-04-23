import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { useTheme } from '../context/ThemeContext';

export default function AdminDashboard() {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [paths, setPaths] = useState([]);
  const [newPath, setNewPath] = useState({ name: '', description: '' });
  const [editPath, setEditPath] = useState(null); // { _id, name, description }
  const [expandedPath, setExpandedPath] = useState(null); // pathId whose skills panel is open
  const [skillsMap, setSkillsMap] = useState({}); // { pathId: [skills] }
  const [newSkill, setNewSkill] = useState({ skillName: '', category: 'General', weight: 50 });
  const [editSkill, setEditSkill] = useState(null); // { _id, skillName, category, weight }
  const [msg, setMsg] = useState('');

  const strokeColor = isLight ? '#4648D4' : '#c0c1ff';
  const emeraldHighlight = isLight ? '#006C49' : '#4edea2';
  const surfaceHigh = isLight ? '#EBF0FA' : '#222a3d';
  const labelColor = isLight ? '#111C2D' : '#dee5ff';

  useEffect(() => { load(); }, []);

  const load = async () => {
    const d = await apiFetch('/careers').catch(console.error);
    if (d) setPaths(d.careers || []);
  };

  const flash = (text) => { setMsg(text); setTimeout(() => setMsg(''), 3000); };

  // ─── Career Path CRUD ──────────────────────────────────────────────────────
  const addPath = async (e) => {
    e.preventDefault();
    if (!newPath.name.trim()) return;
    await apiFetch('/careers', { method: 'POST', body: JSON.stringify(newPath) });
    setNewPath({ name: '', description: '' });
    flash('✅ Career path added!');
    load();
  };

  const saveEditPath = async () => {
    if (!editPath) return;
    await apiFetch(`/careers/${editPath._id}`, { method: 'PUT', body: JSON.stringify({ name: editPath.name, description: editPath.description }) });
    setEditPath(null);
    flash('✅ Career path updated!');
    load();
  };

  const deletePath = async (id) => {
    if (!confirm('Delete this career path and all its skills? This cannot be undone.')) return;
    await apiFetch(`/careers/${id}`, { method: 'DELETE' });
    flash('🗑 Path deleted.');
    load();
  };

  // ─── Skills Management ─────────────────────────────────────────────────────
  const loadSkills = async (pathId) => {
    const d = await apiFetch(`/careers/${pathId}/skills`).catch(console.error);
    if (d) setSkillsMap(prev => ({ ...prev, [pathId]: d.skills || [] }));
  };

  const toggleSkills = async (pathId) => {
    if (expandedPath === pathId) {
      setExpandedPath(null);
    } else {
      setExpandedPath(pathId);
      setNewSkill({ skillName: '', category: 'General', weight: 50 });
      setEditSkill(null);
      await loadSkills(pathId);
    }
  };

  const addSkill = async (pathId) => {
    if (!newSkill.skillName.trim()) return;
    await apiFetch(`/careers/${pathId}/skills`, { method: 'POST', body: JSON.stringify(newSkill) });
    setNewSkill({ skillName: '', category: 'General', weight: 50 });
    flash('✅ Skill added!');
    loadSkills(pathId);
  };

  const saveEditSkill = async (pathId) => {
    if (!editSkill) return;
    await apiFetch(`/careers/skills/${editSkill._id}`, { method: 'PUT', body: JSON.stringify(editSkill) });
    setEditSkill(null);
    flash('✅ Skill updated!');
    loadSkills(pathId);
  };

  const deleteSkill = async (skillId, pathId) => {
    if (!confirm('Delete this skill?')) return;
    await apiFetch(`/careers/skills/${skillId}`, { method: 'DELETE' });
    flash('🗑 Skill deleted.');
    loadSkills(pathId);
  };

  const inputStyle = {
    background: isLight ? '#fff' : '#0d1425',
    color: isLight ? '#111C2D' : '#dee5ff',
    border: `1px solid ${isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.08)'}`,
    padding: '9px 12px', borderRadius: 8, fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box'
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="glass-card flex justify-between items-center mb-4">
        <h2 className="text-accent">Admin Dashboard</h2>
        <span style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>
          Manage career paths, skills and user content below.
        </span>
      </div>

      {msg && (
        <div style={{ padding: '12px 18px', borderRadius: 10, background: 'rgba(78,222,162,0.1)', color: emeraldHighlight, fontWeight: 700, marginBottom: 16, border: '1px solid rgba(78,222,162,0.2)' }}>
          {msg}
        </div>
      )}

      {/* Add New Career Path */}
      <div className="glass-card mb-4">
        <h3 className="text-accent mb-4">➕ Add New Career Path</h3>
        <form onSubmit={addPath}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: 12, alignItems: 'end' }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--on-surface-variant)', display: 'block', marginBottom: 6 }}>Path Name *</label>
              <input style={inputStyle} placeholder="e.g. Full Stack Developer" value={newPath.name} onChange={e => setNewPath(p => ({ ...p, name: e.target.value }))} required />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--on-surface-variant)', display: 'block', marginBottom: 6 }}>Description</label>
              <input style={inputStyle} placeholder="Brief description of this career path" value={newPath.description} onChange={e => setNewPath(p => ({ ...p, description: e.target.value }))} />
            </div>
            <button className="btn-cta" type="submit" style={{ padding: '9px 20px', whiteSpace: 'nowrap' }}>+ Add Path</button>
          </div>
        </form>
      </div>

      {/* Career Paths Table */}
      <div className="glass-card">
        <h3 className="text-accent mb-4">📋 Manage Career Paths</h3>
        <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--primary)', borderBottom: `1px solid ${isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)'}` }}>Name</th>
              <th style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--primary)', borderBottom: `1px solid ${isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)'}` }}>Description</th>
              <th style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--primary)', borderBottom: `1px solid ${isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)'}` }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paths.map(p => (
              <>
                <tr key={p._id} style={{ borderBottom: `1px solid ${isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.04)'}` }}>
                  <td style={{ padding: '12px', fontWeight: 600, color: labelColor }}>
                    {editPath?._id === p._id ? (
                      <input style={{ ...inputStyle, width: 180 }} value={editPath.name} onChange={e => setEditPath(ep => ({ ...ep, name: e.target.value }))} />
                    ) : p.name}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--on-surface-variant)', fontSize: 14 }}>
                    {editPath?._id === p._id ? (
                      <input style={{ ...inputStyle }} value={editPath.description} onChange={e => setEditPath(ep => ({ ...ep, description: e.target.value }))} />
                    ) : p.description?.substring(0, 80) + (p.description?.length > 80 ? '…' : '')}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {editPath?._id === p._id ? (
                        <>
                          <button onClick={saveEditPath} style={{ padding: '6px 12px', borderRadius: 6, background: emeraldHighlight, color: '#001', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>Save</button>
                          <button onClick={() => setEditPath(null)} style={{ padding: '6px 12px', borderRadius: 6, background: surfaceHigh, color: labelColor, border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>Cancel</button>
                        </>
                      ) : (
                        <button onClick={() => setEditPath({ _id: p._id, name: p.name, description: p.description || '' })} style={{ padding: '6px 12px', borderRadius: 6, background: surfaceHigh, color: strokeColor, border: `1px solid ${strokeColor}40`, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>✏️ Edit</button>
                      )}
                      <button onClick={() => toggleSkills(p._id)} style={{ padding: '6px 12px', borderRadius: 6, background: surfaceHigh, color: emeraldHighlight, border: `1px solid ${emeraldHighlight}40`, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                        {expandedPath === p._id ? '▲ Skills' : '⚙️ Skills'}
                      </button>
                      <button onClick={() => deletePath(p._id)} style={{ padding: '6px 12px', borderRadius: 6, background: 'rgba(255,107,107,0.1)', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.3)', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>🗑 Delete</button>
                    </div>
                  </td>
                </tr>

                {/* Skills panel (expandable) */}
                {expandedPath === p._id && (
                  <tr key={`skills-${p._id}`}>
                    <td colSpan={3} style={{ padding: '0 12px 16px 12px', background: isLight ? 'rgba(70,72,212,0.03)' : 'rgba(255,255,255,0.02)' }}>
                      <div style={{ padding: 16, borderRadius: 10, border: `1px solid ${strokeColor}30`, marginTop: 8 }}>
                        <div style={{ fontWeight: 700, color: strokeColor, marginBottom: 14, fontSize: 15 }}>
                          ⚙️ Skills for: {p.name}
                        </div>

                        {/* Add Skill Form */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px auto', gap: 10, marginBottom: 16, alignItems: 'end' }}>
                          <div>
                            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--on-surface-variant)', display: 'block', marginBottom: 4 }}>Skill Name</label>
                            <input style={inputStyle} placeholder="e.g. JavaScript" value={newSkill.skillName} onChange={e => setNewSkill(s => ({ ...s, skillName: e.target.value }))} />
                          </div>
                          <div>
                            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--on-surface-variant)', display: 'block', marginBottom: 4 }}>Category</label>
                            <input style={inputStyle} placeholder="e.g. Frontend, Backend" value={newSkill.category} onChange={e => setNewSkill(s => ({ ...s, category: e.target.value }))} />
                          </div>
                          <div>
                            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--on-surface-variant)', display: 'block', marginBottom: 4 }}>Weight (0–100)</label>
                            <input type="number" min="0" max="100" style={inputStyle} value={newSkill.weight} onChange={e => setNewSkill(s => ({ ...s, weight: Number(e.target.value) }))} />
                          </div>
                          <button onClick={() => addSkill(p._id)} className="btn-cta" style={{ padding: '9px 14px', whiteSpace: 'nowrap' }}>+ Add Skill</button>
                        </div>

                        {/* Skills Table */}
                        {(skillsMap[p._id] || []).length === 0 ? (
                          <p className="text-muted text-sm">No skills added for this path yet.</p>
                        ) : (
                          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                              <tr>
                                {['Skill Name', 'Category', 'Weight', 'Actions'].map(h => (
                                  <th key={h} style={{ textAlign: 'left', padding: '8px 10px', color: 'var(--primary)', fontSize: 13, borderBottom: `1px solid ${isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)'}` }}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {(skillsMap[p._id] || []).map(sk => (
                                <tr key={sk._id} style={{ borderBottom: `1px solid ${isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.03)'}` }}>
                                  <td style={{ padding: '8px 10px', fontSize: 14, color: labelColor }}>
                                    {editSkill?._id === sk._id
                                      ? <input style={{ ...inputStyle, width: 140 }} value={editSkill.skillName} onChange={e => setEditSkill(es => ({ ...es, skillName: e.target.value }))} />
                                      : sk.skillName}
                                  </td>
                                  <td style={{ padding: '8px 10px', fontSize: 14, color: 'var(--on-surface-variant)' }}>
                                    {editSkill?._id === sk._id
                                      ? <input style={{ ...inputStyle, width: 120 }} value={editSkill.category} onChange={e => setEditSkill(es => ({ ...es, category: e.target.value }))} />
                                      : sk.category}
                                  </td>
                                  <td style={{ padding: '8px 10px', fontSize: 14, color: 'var(--on-surface-variant)' }}>
                                    {editSkill?._id === sk._id
                                      ? <input type="number" min="0" max="100" style={{ ...inputStyle, width: 70 }} value={editSkill.weight} onChange={e => setEditSkill(es => ({ ...es, weight: Number(e.target.value) }))} />
                                      : sk.weight}
                                  </td>
                                  <td style={{ padding: '8px 10px' }}>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                      {editSkill?._id === sk._id ? (
                                        <>
                                          <button onClick={() => saveEditSkill(p._id)} style={{ padding: '4px 10px', borderRadius: 6, background: emeraldHighlight, color: '#001', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>Save</button>
                                          <button onClick={() => setEditSkill(null)} style={{ padding: '4px 10px', borderRadius: 6, background: surfaceHigh, color: labelColor, border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>Cancel</button>
                                        </>
                                      ) : (
                                        <button onClick={() => setEditSkill({ _id: sk._id, skillName: sk.skillName, category: sk.category, weight: sk.weight })} style={{ padding: '4px 10px', borderRadius: 6, background: surfaceHigh, color: strokeColor, border: `1px solid ${strokeColor}30`, fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>Edit</button>
                                      )}
                                      <button onClick={() => deleteSkill(sk._id, p._id)} style={{ padding: '4px 10px', borderRadius: 6, background: 'rgba(255,107,107,0.1)', color: '#ff6b6b', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>Delete</button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
        {paths.length === 0 && <p className="text-center text-muted mt-4">No career paths found. Add one above.</p>}
      </div>
    </div>
  );
}
