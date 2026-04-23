import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function ProfilePage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [form, setForm] = useState({ fullname: '', phone: '', education: '', experience: '', skills: '' });
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState('');
  const [profilePhotoPath, setProfilePhotoPath] = useState('');
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('success');
  const [isEditing, setIsEditing] = useState(false);
  const [careerPath, setCareerPath] = useState(null);
  const [careerSkills, setCareerSkills] = useState([]);
  const fileRef = useRef();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const d = await apiFetch('/users/profile');
      const u = d.user || {};
      setForm({
        fullname: u.fullname || '',
        phone: u.phone || '',
        education: u.education || '',
        experience: u.experience || '',
        skills: u.skills || '',
      });
      if (u.profilePhoto) {
        setProfilePhotoPath(u.profilePhoto);
        setPreview(`http://localhost:5000/${u.profilePhoto}`);
      }
      if (u.selectedPath) {
        const pathId = u.selectedPath._id || u.selectedPath;
        setCareerPath(u.selectedPath);
        const sk = await apiFetch(`/careers/${pathId}/skills`);
        setCareerSkills(sk.skills || []);
      }
      setLoaded(true);
    } catch (err) {
      console.error(err);
      setLoaded(true);
    }
  };

  // Real profile completion — 6 fields like old PHP
  const completionFields = {
    fullname: !!form.fullname.trim(),
    phone: !!form.phone.trim(),
    education: !!form.education.trim(),
    experience: !!form.experience.trim(),
    skills: !!form.skills.trim(),
    photo: !!profilePhotoPath,
  };
  const filledCount = Object.values(completionFields).filter(Boolean).length;
  const totalFields = Object.keys(completionFields).length;
  const progressPercent = Math.round((filledCount / totalFields) * 100);
  const isComplete = progressPercent === 100;

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/users/profile', { method: 'PUT', body: JSON.stringify(form) });
      if (photo) {
        const fd = new FormData();
        fd.append('profile_photo', photo);
        const res = await apiFetch('/users/upload-photo', { method: 'POST', body: fd });
        if (res.profilePhoto) {
          setProfilePhotoPath(res.profilePhoto);
          setPreview(`http://localhost:5000/${res.profilePhoto}`);
        }
      }
      setMsg('Profile updated successfully.');
      setMsgType('success');
      setTimeout(() => setMsg(''), 3500);
      setIsEditing(false);
      setPhoto(null);
      // Reload from server to confirm saved
      await fetchProfile();
    } catch (err) {
      setMsg(err.message);
      setMsgType('error');
    }
  };

  const handleCancel = async () => {
    setIsEditing(false);
    setPhoto(null);
    // Revert to server state
    await fetchProfile();
  };

  const handlePhoto = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowed.includes(f.type)) { alert('Only JPG/PNG allowed'); return; }
    if (f.size > 2 * 1024 * 1024) { alert('Max 2MB allowed'); return; }
    setPhoto(f);
    setPreview(URL.createObjectURL(f));
  };

  const isLight = theme === 'light';
  const strokeColor = isLight ? '#4648D4' : '#c0c1ff';
  const emeraldHighlight = isLight ? '#006C49' : '#4edea2';
  const surfaceHigh = isLight ? '#EBF0FA' : '#222a3d';

  if (!loaded) return <div className="loading-screen">Loading profile...</div>;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-4" style={{ marginBottom: 32 }}>
        <div className="flex items-center gap-5">
          <div style={{ position: 'relative' }}>
            {preview ? (
              <img
                src={preview}
                alt="Profile"
                style={{ width: 80, height: 80, borderRadius: 16, border: `2px solid ${strokeColor}60`, objectFit: 'cover' }}
              />
            ) : (
              <div style={{ width: 80, height: 80, borderRadius: 16, background: `linear-gradient(135deg, ${strokeColor}, ${emeraldHighlight})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 800, color: '#fff' }}>
                {(form.fullname || user?.name || 'U')[0].toUpperCase()}
              </div>
            )}

            {/* Completion badge — only show real % */}
            {!isEditing && (
              <div style={{
                position: 'absolute', bottom: -8, right: -8,
                backgroundColor: isComplete ? emeraldHighlight : (isLight ? '#D97706' : '#f59e0b'),
                color: '#fff', fontSize: 10, fontWeight: 800,
                padding: '3px 7px', borderRadius: 20, boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
                whiteSpace: 'nowrap'
              }}>
                {progressPercent}% {isComplete ? '✓' : ''}
              </div>
            )}

            {isEditing && (
              <button
                type="button"
                onClick={() => fileRef.current.click()}
                style={{ position: 'absolute', bottom: -8, right: -8, backgroundColor: strokeColor, color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 7px', borderRadius: 20, border: 'none', cursor: 'pointer' }}
              >
                UPLOAD
              </button>
            )}
            <input ref={fileRef} type="file" accept=".png,.jpg,.jpeg" style={{ display: 'none' }} onChange={handlePhoto} />
          </div>

          <div>
            <h1 className="text-accent" style={{ fontSize: '28px', marginBottom: 4, letterSpacing: '-0.02em', fontWeight: 800 }}>
              {form.fullname || user?.name || 'New Candidate'}
            </h1>
            <p className="text-muted" style={{ fontWeight: 600 }}>
              {form.education || 'Add your educational background'}
              {form.phone ? ` • ${form.phone}` : ''}
            </p>
            {careerPath && (
              <p style={{ color: strokeColor, fontSize: 13, fontWeight: 600, marginTop: 4 }}>
                🎓 {careerPath.name || ''}
              </p>
            )}
            <div className="flex gap-2 mt-2">
              <span style={{ backgroundColor: isLight ? '#EBF0FA' : '#3d4966', color: isLight ? '#111C2D' : '#acb8da', padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>Registered</span>
              <span style={{ backgroundColor: isLight ? 'rgba(0,108,73,0.1)' : 'rgba(78,222,162,0.1)', color: emeraldHighlight, padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>Open to Roles</span>
            </div>
          </div>
        </div>

        {/* Profile Completion Bar */}
        <div style={{ textAlign: 'right', minWidth: 200 }}>
          <div style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginBottom: 6, fontWeight: 600 }}>Profile Completion</div>
          <div style={{ width: '100%', height: 10, backgroundColor: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.06)', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progressPercent}%`, background: `linear-gradient(90deg, ${strokeColor}, ${emeraldHighlight})`, borderRadius: 8, transition: 'width 600ms ease' }} />
          </div>
          <div style={{ marginTop: 6, fontWeight: 800, color: isComplete ? emeraldHighlight : '#f59e0b', fontSize: 14 }}>{progressPercent}%</div>
          <div className="flex gap-3 mt-2 justify-end">
            <button onClick={() => setIsEditing(!isEditing)} className="ghost-border" style={{ padding: '8px 20px', borderRadius: 12, backgroundColor: 'transparent', color: isLight ? '#111C2D' : '#dee5ff', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
            {isEditing && <button onClick={handleSave} className="btn-cta" style={{ padding: '8px 20px', fontSize: 14 }}>Save Profile</button>}
          </div>
        </div>
      </div>

      {msg && (
        <div style={{
          background: msgType === 'success' ? (isLight ? 'rgba(0,108,73,0.1)' : 'rgba(105,246,184,0.1)') : 'rgba(255,107,107,0.1)',
          color: msgType === 'success' ? emeraldHighlight : '#ff6b6b',
          padding: 16, borderRadius: 12, marginBottom: 24, fontWeight: 700
        }}>{msg}</div>
      )}

      {/* Bento Grid */}
      <div className="bento-grid">

        {/* Basic Info / AI Summary */}
        <div className="glass-card col-span-12 lg:col-span-8 flex" style={{ flexDirection: 'column', minHeight: 320 }}>
          {isEditing ? (
            <div>
              <h2 className="text-accent" style={{ fontSize: 20, marginBottom: 16 }}>Edit Profile Details</h2>
              <div className="two-col" style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label className="text-muted" style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Full Name</label>
                  <input className="well-input mt-2" placeholder="Your full name" value={form.fullname} onChange={e => setForm({ ...form, fullname: e.target.value })} />
                </div>
                <div>
                  <label className="text-muted" style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Phone</label>
                  <input className="well-input mt-2" placeholder="Phone number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="text-muted" style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Education</label>
                  <input className="well-input mt-2" placeholder="e.g. B.Tech Computer Science, 2024" value={form.education} onChange={e => setForm({ ...form, education: e.target.value })} />
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
                <h2 className="text-accent flex items-center gap-2" style={{ fontSize: 20 }}>About Me</h2>
              </div>
              {form.fullname || form.education || form.experience ? (
                <div style={{ fontSize: 15, lineHeight: 1.7, color: isLight ? '#111C2D' : '#c7c5d7' }}>
                  {form.fullname && <p><strong>Name:</strong> {form.fullname}</p>}
                  {form.education && <p><strong>Education:</strong> {form.education}</p>}
                  {form.phone && <p><strong>Phone:</strong> {form.phone}</p>}
                  {careerPath && <p><strong>Career Path:</strong> {careerPath.name}</p>}
                </div>
              ) : (
                <div className="text-muted" style={{ fontStyle: 'italic' }}>
                  No profile info added yet. Click "Edit Profile" to fill in your details.
                </div>
              )}

              {form.fullname && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, borderTop: `1px solid ${isLight ? 'rgba(17,28,45,0.1)' : 'rgba(70,69,84,0.3)'}`, paddingTop: 20, marginTop: 'auto' }}>
                  <div>
                    <p className="text-muted" style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Profile</p>
                    <div style={{ fontSize: 24, fontWeight: 800, color: isComplete ? emeraldHighlight : '#f59e0b' }}>{progressPercent}%</div>
                  </div>
                  <div>
                    <p className="text-muted" style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Skills Listed</p>
                    <div className="text-accent" style={{ fontSize: 24, fontWeight: 800 }}>{form.skills ? form.skills.split(',').filter(Boolean).length : 0}</div>
                  </div>
                  <div>
                    <p className="text-muted" style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Status</p>
                    <div style={{ fontSize: 18, fontWeight: 800, color: isLight ? '#111C2D' : '#dee5ff' }}>{isComplete ? 'Complete' : 'Incomplete'}</div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Skills / Verified Stack */}
        <div className="glass-card col-span-12 lg:col-span-4">
          <h2 className="text-accent" style={{ fontSize: 20, marginBottom: 20 }}>Skills</h2>
          {isEditing ? (
            <div>
              <label className="text-muted" style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Skills (comma separated)</label>
              <textarea className="well-input mt-2" style={{ minHeight: 150, borderRadius: 12 }} placeholder="e.g. JavaScript, React, Node.js" value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} />
            </div>
          ) : (
            <>
              {form.skills ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Show actual career path skill weights if available, else just list user skills */}
                  {careerSkills.length > 0
                    ? careerSkills.slice(0, 5).map((skill, i) => (
                      <div key={i}>
                        <div className="flex justify-between" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                          <span style={{ color: isLight ? '#111C2D' : '#dee5ff' }}>{skill.skillName}</span>
                          <span className="text-accent">{skill.weight}%</span>
                        </div>
                        <div style={{ height: 6, width: '100%', backgroundColor: isLight ? '#EBF0FA' : '#222a3d', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${Math.min(100, skill.weight)}%`, backgroundColor: strokeColor, borderRadius: 4 }} />
                        </div>
                      </div>
                    ))
                    : form.skills.split(',').filter(Boolean).slice(0, 5).map((skill, i) => (
                      <div key={i}>
                        <div className="flex justify-between" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                          <span style={{ color: isLight ? '#111C2D' : '#dee5ff' }}>{skill.trim()}</span>
                        </div>
                        <div style={{ height: 6, width: '100%', backgroundColor: isLight ? '#EBF0FA' : '#222a3d', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: '60%', backgroundColor: strokeColor, borderRadius: 4 }} />
                        </div>
                      </div>
                    ))
                  }
                  <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {form.skills.split(',').filter(Boolean).map((skill, i) => (
                      <span key={i} style={{ padding: '4px 10px', backgroundColor: surfaceHigh, fontSize: 12, borderRadius: 6, color: isLight ? '#111C2D' : '#dee5ff', fontWeight: 500 }}>
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <span className="text-muted">No skills added yet. Edit profile to add your skills.</span>
              )}
            </>
          )}
        </div>

        {/* Experience */}
        <div className="glass-card col-span-12 lg:col-span-12">
          <h2 className="text-accent" style={{ fontSize: 20, marginBottom: 20 }}>Work Experience</h2>
          {isEditing ? (
            <div>
              <label className="text-muted" style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Work Experience</label>
              <textarea className="well-input mt-2" style={{ minHeight: 150, borderRadius: 12 }} placeholder="Describe your work experience..." value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })} />
            </div>
          ) : (
            form.experience ? (
              <div style={{ position: 'relative', paddingLeft: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ position: 'absolute', left: 11, top: 8, bottom: 8, width: 2, backgroundColor: isLight ? 'rgba(17,28,45,0.1)' : 'rgba(70,69,84,0.3)' }} />
                {form.experience.split('\n').filter(Boolean).map((expLine, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: -32, top: 4, width: 24, height: 24, borderRadius: '50%', backgroundColor: isLight ? '#FFFFFF' : '#171f32', border: `2px solid ${i === 0 ? strokeColor : (isLight ? '#4B5563' : '#464554')}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: i === 0 ? strokeColor : (isLight ? '#4B5563' : '#464554') }} />
                    </div>
                    <p className="text-muted" style={{ fontSize: 14, lineHeight: 1.6 }}>{expLine}</p>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-muted">No experience added yet. Edit profile to add your work history.</span>
            )
          )}
        </div>
      </div>

      {/* Bottom completion alert */}
      {!isComplete && (
        <div style={{
          marginTop: 24,
          padding: '14px 20px',
          borderRadius: 12,
          background: isLight ? 'rgba(217,119,6,0.1)' : 'rgba(245,158,11,0.1)',
          border: `1px solid ${isLight ? 'rgba(217,119,6,0.3)' : 'rgba(245,158,11,0.3)'}`,
          color: isLight ? '#92400E' : '#fbbf24',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16
        }}>
          <div>
            <strong>⚠ Complete your profile ({progressPercent}% done)</strong>
            <div style={{ fontSize: 13, marginTop: 4, opacity: 0.85 }}>
              Missing: {Object.entries(completionFields).filter(([, v]) => !v).map(([k]) => k).join(', ')}. A complete profile improves recommendations and visibility to employers.
            </div>
          </div>
          <button onClick={() => setIsEditing(true)} className="btn-cta" style={{ fontSize: 13, padding: '8px 16px', whiteSpace: 'nowrap' }}>
            Complete Now
          </button>
        </div>
      )}
    </div>
  );
}
