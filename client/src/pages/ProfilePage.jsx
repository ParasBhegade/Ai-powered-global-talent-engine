import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function ProfilePage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [form, setForm] = useState({ fullname: '', phone: '', education: '', experience: '', skills: '', resumeRaw: '', resumeParsed: null });
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState('');
  const [profilePhotoPath, setProfilePhotoPath] = useState('');
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('success');
  const [isEditing, setIsEditing] = useState(false);
  const [careerPath, setCareerPath] = useState(null);
  const [careerSkills, setCareerSkills] = useState([]);
  const fileRef = useRef();
  const resumeRef = useRef();
  const [loaded, setLoaded] = useState(false);

  // Resume Analyzer states
  const [resumeAnalyzing, setResumeAnalyzing] = useState(false);
  const [resumeRawText, setResumeRawText] = useState('');
  const [resumeExtracted, setResumeExtracted] = useState(null);
  const [resumeSelected, setResumeSelected] = useState({ name: true, email: true, phone: true, education: true, experience: true, skills: true, certifications: true });
  const [resumeError, setResumeError] = useState('');
  const [resumeApplied, setResumeApplied] = useState(false);

  useEffect(() => { fetchProfile(); }, []);

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
        resumeRaw: u.resumeRaw || '',
        resumeParsed: u.resumeParsed || null,
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

  // Real profile completion
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
      await fetchProfile();
    } catch (err) {
      setMsg(err.message);
      setMsgType('error');
    }
  };

  const handleCancel = async () => {
    setIsEditing(false);
    setPhoto(null);
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

  // Resume upload handler
  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Reset file input so same file can be re-uploaded
    e.target.value = '';

    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!allowed.includes(file.type)) {
      setResumeError('Only PDF and DOCX files are supported.');
      setTimeout(() => setResumeError(''), 4000);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setResumeError('File too large. Maximum size is 5MB.');
      setTimeout(() => setResumeError(''), 4000);
      return;
    }

    setResumeAnalyzing(true);
    setResumeError('');
    setResumeApplied(false);

    try {
      const fd = new FormData();
      fd.append('resume', file);
      const res = await apiFetch('/users/resume/preview', { method: 'POST', body: fd });
      setResumeRawText(res.rawText);
      setResumeExtracted(res.parsedData);
      setResumeSelected({ name: true, email: true, phone: true, education: true, experience: true, skills: true, certifications: true });
    } catch (err) {
      setResumeError(err.message || 'Failed to analyze resume.');
      setTimeout(() => setResumeError(''), 5000);
    } finally {
      setResumeAnalyzing(false);
    }
  };

  // Apply extracted fields to form
  const handleApplyResume = () => {
    const updates = {
      resumeRaw: resumeRawText,
      resumeParsed: resumeExtracted
    };
    if (resumeSelected.name && resumeExtracted.name) updates.fullname = resumeExtracted.name;
    if (resumeSelected.phone && resumeExtracted.phone) updates.phone = resumeExtracted.phone;
    if (resumeSelected.education && resumeExtracted.education?.length) updates.education = resumeExtracted.education.join('\\n');
    if (resumeSelected.experience && resumeExtracted.experience?.length) updates.experience = resumeExtracted.experience.join('\\n');
    if (resumeSelected.skills && resumeExtracted.skills?.length) updates.skills = resumeExtracted.skills.join(', ');
    
    setForm(prev => ({ ...prev, ...updates }));
    setResumeExtracted(null);
    setResumeApplied(true);
    setTimeout(() => setResumeApplied(false), 4000);
  };

  const resumeFieldLabels = {
    name: 'Full Name',
    email: 'Email',
    phone: 'Phone',
    education: 'Education',
    experience: 'Work Experience',
    skills: 'Skills',
    certifications: 'Certifications'
  };

  const isLight = theme === 'light';
  const strokeColor = isLight ? '#4648D4' : '#c0c1ff';
  const emeraldHighlight = isLight ? '#006C49' : '#4edea2';
  const surfaceHigh = isLight ? '#EBF0FA' : '#222a3d';

  if (!loaded) return <div className="loading-screen">Loading profile...</div>;

  return (
    <div className="page-container">

      {/* ── Profile incomplete alert — TOP ── */}
      {!isComplete && (
        <div style={{
          marginBottom: 20,
          padding: '12px 18px',
          borderRadius: 10,
          background: isLight ? 'rgba(217,119,6,0.08)' : 'rgba(245,158,11,0.08)',
          border: `1px solid ${isLight ? 'rgba(217,119,6,0.25)' : 'rgba(245,158,11,0.25)'}`,
          color: isLight ? '#92400E' : '#fbbf24',
          display: 'flex', flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12
        }}>
          <div>
            <strong style={{ fontSize: 13 }}>Profile incomplete ({progressPercent}%)</strong>
            <div style={{ fontSize: 12, marginTop: 3, opacity: 0.85 }}>
              Missing: {Object.entries(completionFields).filter(([, v]) => !v).map(([k]) => k).join(', ')}
            </div>
          </div>
          <button onClick={() => setIsEditing(true)} style={{
            padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: isLight ? '#D97706' : '#f59e0b', color: '#fff', fontWeight: 700, fontSize: 12
          }}>
            Complete Now
          </button>
        </div>
      )}

      {/* ── Save/error message ── */}
      {msg && (
        <div style={{
          background: msgType === 'success' ? (isLight ? 'rgba(0,108,73,0.1)' : 'rgba(105,246,184,0.1)') : 'rgba(255,107,107,0.1)',
          color: msgType === 'success' ? emeraldHighlight : '#ff6b6b',
          padding: '12px 18px', borderRadius: 10, marginBottom: 18, fontWeight: 700, fontSize: 13
        }}>{msg}</div>
      )}

      {/* ── Header ── */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between',
        alignItems: 'flex-start', gap: 24, marginBottom: 28
      }}>
        {/* Left: avatar + info */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
          {/* Avatar  */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {preview ? (
              <img
                src={preview} alt="Profile"
                style={{ width: 84, height: 84, borderRadius: 16, objectFit: 'cover', border: `2px solid ${strokeColor}50` }}
              />
            ) : (
              <div style={{ width: 84, height: 84, borderRadius: 16, background: `linear-gradient(135deg, ${strokeColor}, ${emeraldHighlight})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 800, color: '#fff' }}>
                {(form.fullname || user?.name || 'U')[0].toUpperCase()}
              </div>
            )}
            {/* Photo upload button — clean, below avatar */}
            {isEditing && (
              <button
                type="button"
                onClick={() => fileRef.current.click()}
                style={{
                  padding: '4px 12px', borderRadius: 8, border: `1px solid ${strokeColor}`,
                  background: 'transparent', color: strokeColor,
                  fontSize: 11, fontWeight: 700, cursor: 'pointer'
                }}
              >
                Change Photo
              </button>
            )}
            <input ref={fileRef} type="file" accept=".png,.jpg,.jpeg" style={{ display: 'none' }} onChange={handlePhoto} />
          </div>

          {/* Name, education, badges */}
          <div style={{ paddingTop: 4 }}>
            <h1 className="text-accent" style={{ fontSize: 26, marginBottom: 4, letterSpacing: '-0.02em', fontWeight: 800 }}>
              {form.fullname || user?.name || 'New Candidate'}
            </h1>
            <p className="text-muted" style={{ fontWeight: 500, fontSize: 14 }}>
              {form.education || 'Add your educational background'}
              {form.phone ? ` · ${form.phone}` : ''}
            </p>
            {careerPath && (
              <p style={{ color: strokeColor, fontSize: 12, fontWeight: 600, marginTop: 4 }}>
                {careerPath.name || ''}
              </p>
            )}
            <div className="flex gap-2" style={{ marginTop: 10 }}>
              <span style={{ backgroundColor: isLight ? '#EBF0FA' : '#3d4966', color: isLight ? '#111C2D' : '#acb8da', padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>Registered</span>
              <span style={{ backgroundColor: isLight ? 'rgba(0,108,73,0.1)' : 'rgba(78,222,162,0.1)', color: emeraldHighlight, padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>Open to Roles</span>
            </div>
          </div>
        </div>

        {/* Right: completion bar + edit button */}
        <div style={{ minWidth: 180, textAlign: 'right' }}>
          <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginBottom: 6, fontWeight: 600 }}>
            Profile Completion
          </div>
          {/* Progress bar track */}
          <div style={{
            width: '100%', height: 8,
            backgroundColor: isLight ? '#D1D5DB' : 'rgba(255,255,255,0.08)',
            borderRadius: 6, overflow: 'hidden'
          }}>
            <div style={{
              height: '100%', width: `${progressPercent}%`,
              background: isLight ? '#111' : '#fff',
              borderRadius: 6, transition: 'width 600ms ease'
            }} />
          </div>
          <div style={{ marginTop: 5, fontWeight: 800, color: isComplete ? emeraldHighlight : '#f59e0b', fontSize: 13 }}>
            {progressPercent}%
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            {isEditing ? (
              <>
                <button onClick={handleCancel} style={{ padding: '7px 16px', borderRadius: 10, border: `1px solid ${isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.1)'}`, background: 'transparent', color: 'var(--on-surface)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button onClick={handleSave} className="btn-cta" style={{ padding: '7px 16px', fontSize: 13 }}>
                  Save
                </button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)} style={{
                padding: '7px 18px', borderRadius: 10,
                border: `1px solid ${isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.1)'}`,
                background: 'transparent',
                color: 'var(--on-surface)',
                fontWeight: 700, fontSize: 13, cursor: 'pointer'
              }}>
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Bento Grid ── */}
      <div className="bento-grid">

        {/* About / Edit */}
        <div className="glass-card col-span-12 lg:col-span-8" style={{ minHeight: 280 }}>
          {isEditing ? (
            <div>
              <h2 className="text-accent" style={{ fontSize: 18, marginBottom: 18 }}>Edit Profile Details</h2>

              {/* Resume Upload Banner */}
              <div className="resume-upload-banner" onClick={() => resumeRef.current.click()} role="button" tabIndex={0} id="resume-upload-trigger">
                <div className="resume-upload-icon">📄</div>
                <div className="resume-upload-info">
                  <h4>Quick Fill from Resume</h4>
                  <p>Upload your PDF or DOCX resume to auto-fill profile fields instantly</p>
                </div>
                <span className="resume-upload-badge">AI Powered</span>
              </div>
              <input ref={resumeRef} type="file" accept=".pdf,.docx" style={{ display: 'none' }} onChange={handleResumeUpload} />

              {/* Analyzing State */}
              {resumeAnalyzing && (
                <div className="resume-analyzing">
                  <div className="resume-analyzing-spinner" />
                  <div className="resume-analyzing-text">Analyzing your resume with AI...</div>
                </div>
              )}

              {/* Resume Error */}
              {resumeError && (
                <div style={{
                  padding: '10px 16px', borderRadius: 10, marginBottom: 16,
                  background: 'rgba(255,107,107,0.1)', color: '#ff6b6b',
                  fontSize: 13, fontWeight: 700
                }}>
                  {resumeError}
                </div>
              )}

              {/* Resume Applied Success */}
              {resumeApplied && (
                <div className="resume-success-flash">
                  ✓ Resume fields applied to your profile
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label className="text-muted" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>Full Name</label>
                  <input className="well-input mt-2" placeholder="Your full name" value={form.fullname} onChange={e => setForm({ ...form, fullname: e.target.value })} />
                </div>
                <div>
                  <label className="text-muted" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>Phone</label>
                  <input
                    className="well-input mt-2"
                    type="tel"
                    inputMode="tel"
                    pattern="[0-9+\-\s]{7,15}"
                    placeholder="+91 9876543210"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="text-muted" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>Education</label>
                  <input className="well-input mt-2" placeholder="e.g. B.Tech Computer Science, 2024" value={form.education} onChange={e => setForm({ ...form, education: e.target.value })} />
                </div>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-accent" style={{ fontSize: 18, marginBottom: 18 }}>About Me</h2>
              {form.fullname || form.education || form.experience ? (
                <div style={{ fontSize: 14, lineHeight: 1.8, color: isLight ? '#111C2D' : '#c7c5d7' }}>
                  {form.fullname && <p><strong>Name:</strong> {form.fullname}</p>}
                  {form.education && <p><strong>Education:</strong> {form.education}</p>}
                  {form.phone && <p><strong>Phone:</strong> {form.phone}</p>}
                  {careerPath && <p><strong>Career Path:</strong> {careerPath.name}</p>}
                </div>
              ) : (
                <div className="text-muted" style={{ fontStyle: 'italic', fontSize: 14 }}>
                  No profile info added yet. Click "Edit Profile" to fill in your details.
                </div>
              )}

              {form.fullname && (
                <div style={{ display: 'flex', gap: 32, borderTop: `1px solid ${isLight ? 'rgba(17,28,45,0.08)' : 'rgba(70,69,84,0.25)'}`, paddingTop: 18, marginTop: 20 }}>
                  <div>
                    <p className="text-muted" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Profile</p>
                    <div style={{ fontSize: 22, fontWeight: 800, color: isComplete ? emeraldHighlight : '#f59e0b' }}>{progressPercent}%</div>
                  </div>
                  <div>
                    <p className="text-muted" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Skills</p>
                    <div className="text-accent" style={{ fontSize: 22, fontWeight: 800 }}>{form.skills ? form.skills.split(',').filter(Boolean).length : 0}</div>
                  </div>
                  <div>
                    <p className="text-muted" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Status</p>
                    <div style={{ fontSize: 16, fontWeight: 800, color: isLight ? '#111C2D' : '#dee5ff' }}>{isComplete ? 'Complete' : 'Incomplete'}</div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Skills */}
        <div className="glass-card col-span-12 lg:col-span-4">
          <h2 className="text-accent" style={{ fontSize: 18, marginBottom: 18 }}>Skills</h2>
          {isEditing ? (
            <div>
              <label className="text-muted" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>Skills (comma separated)</label>
              <textarea className="well-input mt-2" style={{ minHeight: 140, borderRadius: 10 }} placeholder="e.g. JavaScript, React, Node.js" value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} />
            </div>
          ) : (
            <>
              {form.skills ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {careerSkills.length > 0
                    ? careerSkills.slice(0, 5).map((skill, i) => (
                      <div key={i}>
                        <div className="flex justify-between" style={{ fontSize: 12, fontWeight: 600, marginBottom: 5 }}>
                          <span style={{ color: isLight ? '#111C2D' : '#dee5ff' }}>{skill.skillName}</span>
                          <span className="text-accent">{skill.weight}%</span>
                        </div>
                        <div style={{ height: 5, width: '100%', backgroundColor: isLight ? '#EBF0FA' : '#222a3d', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${Math.min(100, skill.weight)}%`, backgroundColor: strokeColor, borderRadius: 4 }} />
                        </div>
                      </div>
                    ))
                    : form.skills.split(',').filter(Boolean).slice(0, 5).map((skill, i) => (
                      <div key={i}>
                        <span style={{ color: isLight ? '#111C2D' : '#dee5ff', fontSize: 13, fontWeight: 600 }}>{skill.trim()}</span>
                      </div>
                    ))
                  }
                  <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {form.skills.split(',').filter(Boolean).map((skill, i) => (
                      <span key={i} style={{ padding: '3px 9px', backgroundColor: surfaceHigh, fontSize: 11, borderRadius: 6, color: isLight ? '#111C2D' : '#dee5ff', fontWeight: 500 }}>
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <span className="text-muted" style={{ fontSize: 13 }}>No skills added yet. Edit profile to add your skills.</span>
              )}
            </>
          )}
        </div>

        {/* Work Experience */}
        <div className="glass-card col-span-12">
          <h2 className="text-accent" style={{ fontSize: 18, marginBottom: 18 }}>Work Experience</h2>
          {isEditing ? (
            <div>
              <label className="text-muted" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>Work Experience</label>
              <textarea className="well-input mt-2" style={{ minHeight: 140, borderRadius: 10 }} placeholder="Describe your work experience (one per line)..." value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })} />
            </div>
          ) : (
            form.experience ? (
              <div style={{ position: 'relative', paddingLeft: 28 }}>
                <div style={{ position: 'absolute', left: 9, top: 8, bottom: 8, width: 2, backgroundColor: isLight ? 'rgba(17,28,45,0.08)' : 'rgba(70,69,84,0.25)' }} />
                {form.experience.split('\n').filter(Boolean).map((expLine, i) => (
                  <div key={i} style={{ position: 'relative', marginBottom: 18 }}>
                    <div style={{ position: 'absolute', left: -28, top: 4, width: 20, height: 20, borderRadius: '50%', backgroundColor: isLight ? '#fff' : '#171f32', border: `2px solid ${i === 0 ? strokeColor : (isLight ? '#4B5563' : '#464554')}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: i === 0 ? strokeColor : (isLight ? '#4B5563' : '#464554') }} />
                    </div>
                    <p className="text-muted" style={{ fontSize: 14, lineHeight: 1.6 }}>{expLine}</p>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-muted" style={{ fontSize: 13 }}>No experience added yet. Edit profile to add your work history.</span>
            )
          )}
        </div>
      </div>

      {/* ── Resume Preview Modal ── */}
      {resumeExtracted && (
        <div className="resume-preview-overlay" onClick={(e) => { if (e.target === e.currentTarget) setResumeExtracted(null); }}>
          <div className="resume-preview-modal">
            <div className="resume-preview-header">
              <h3>📄 Extracted Profile Data</h3>
              <button className="resume-close-btn" onClick={() => setResumeExtracted(null)}>✕</button>
            </div>

            <p className="text-muted" style={{ fontSize: 12, marginBottom: 18, marginTop: -12 }}>
              Select the fields you want to apply to your profile
            </p>

            {Object.keys(resumeFieldLabels).map(key => (
              <div className="resume-field-row" key={key}>
                <input
                  type="checkbox"
                  className="resume-field-checkbox"
                  checked={resumeSelected[key]}
                  onChange={() => setResumeSelected(prev => ({ ...prev, [key]: !prev[key] }))}
                  id={`resume-field-${key}`}
                />
                <label className="resume-field-content" htmlFor={`resume-field-${key}`} style={{ cursor: 'pointer' }}>
                  <div className="resume-field-label">{resumeFieldLabels[key]}</div>
                  {resumeExtracted[key] && (Array.isArray(resumeExtracted[key]) ? resumeExtracted[key].length > 0 : String(resumeExtracted[key]).trim() !== '') ? (
                    <div className="resume-field-value">
                      {Array.isArray(resumeExtracted[key]) ? resumeExtracted[key].join('\\n') : resumeExtracted[key]}
                    </div>
                  ) : (
                    <div className="resume-field-empty">Not found in resume</div>
                  )}
                </label>
              </div>
            ))}

            <div className="resume-preview-actions">
              <button className="resume-btn-cancel" onClick={() => setResumeExtracted(null)}>Cancel</button>
              <button
                className="resume-btn-apply"
                onClick={handleApplyResume}
                disabled={!Object.values(resumeSelected).some(Boolean)}
                id="resume-apply-btn"
              >
                Apply Selected Fields
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
