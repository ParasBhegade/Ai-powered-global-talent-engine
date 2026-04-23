import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { useTheme } from '../context/ThemeContext';

export default function InterviewLivePage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const role = params.get('role') || 'Web Developer';
  const difficulty = params.get('difficulty') || 'Beginner';
  const TOTAL = 5;

  const videoRef = useRef(null);
  const streamRef = useRef(null);   // <-- holds the MediaStream for cleanup
  const recognizerRef = useRef(null);
  const faceCheckRef = useRef(null);

  const [cameraReady, setCameraReady] = useState(false);
  const [faceVisible, setFaceVisible] = useState(false);
  const [obstructed, setObstructed] = useState(false);
  const [lookingAway, setLookingAway] = useState(false);
  const [cameraStatus, setCameraStatus] = useState('Initializing camera…');

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answerText, setAnswerText] = useState('Press Start to speak…');
  const [isRecording, setIsRecording] = useState(false);
  const [questionsLoaded, setQuestionsLoaded] = useState(false);

  const isLight = theme === 'light';

  // ─── Full session cleanup ─────────────────────────────────────────────────────
  const cleanupSession = useCallback(() => {
    // Stop all camera/mic tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    // Stop speech recognition
    if (recognizerRef.current) {
      try { recognizerRef.current.stop(); } catch { }
      recognizerRef.current = null;
    }
    // Stop TTS
    try { speechSynthesis.cancel(); } catch { }
    // Stop face check interval
    if (faceCheckRef.current) { clearInterval(faceCheckRef.current); }
    // Exit fullscreen
    if (document.fullscreenElement) {
      try { document.exitFullscreen(); } catch { }
    }
  }, []);

  // ─── Block browser back / page unload during active session ───────────────────
  useEffect(() => {
    const onBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'Your interview is still in progress. Are you sure you want to leave?';
      return e.returnValue;
    };
    window.addEventListener('beforeunload', onBeforeUnload);

    // Also block browser history back during interview
    const onPopState = (e) => {
      const ok = window.confirm('Exit interview? Your progress will be lost and camera will stop.');
      if (ok) {
        cleanupSession();
        navigate('/interview-select', { replace: true });
      } else {
        // Push state back so back doesn't work without confirmation
        window.history.pushState(null, '', window.location.href);
      }
    };
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', onPopState);

    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      window.removeEventListener('popstate', onPopState);
      cleanupSession(); // Clean up when component unmounts (e.g. React Router navigation)
    };
  }, [cleanupSession, navigate]);

  // ─── Camera init ────────────────────────────────────────────────────────────
  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
        });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCameraReady(true);
      } catch {
        setCameraReady(false);
        setCameraStatus('Camera OFF — allow camera to continue.');
        alert('Camera / Microphone access required. Please allow permissions.');
      }
    };
    initCamera();
  }, []);

  // ─── Face detection (pixel brightness) ──────────────────────────────────────
  useEffect(() => {
    if (!cameraReady) return;

    const analyzeFrame = () => {
      const video = videoRef.current;
      if (!video || video.videoWidth === 0) return;
      const cvs = document.createElement('canvas');
      cvs.width = video.videoWidth;
      cvs.height = video.videoHeight;
      const ctx = cvs.getContext('2d');
      ctx.drawImage(video, 0, 0, cvs.width, cvs.height);
      const data = ctx.getImageData(0, 0, cvs.width, cvs.height).data;
      let bright = 0;
      const totalPixels = data.length / 4;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i] > 60 && data[i + 1] > 60 && data[i + 2] > 60) bright++;
      }
      const newObstructed = bright < totalPixels * 0.02;
      const newFaceVisible = bright > totalPixels * 0.08;
      let left = 0, right = 0;
      const y1 = Math.floor(cvs.height * 0.28), y2 = Math.floor(cvs.height * 0.72);
      for (let y = y1; y < y2; y++) {
        for (let x = 0; x < cvs.width; x++) {
          const idx = (y * cvs.width + x) * 4;
          const sum = data[idx] + data[idx + 1] + data[idx + 2];
          if (x < cvs.width / 2) left += sum; else right += sum;
        }
      }
      const lrSum = left + right;
      const newLookingAway = lrSum > 0 && Math.abs(left - right) > lrSum * 0.28;
      setObstructed(newObstructed);
      setFaceVisible(newFaceVisible);
      setLookingAway(newLookingAway);
    };
    faceCheckRef.current = setInterval(analyzeFrame, 600);
    return () => clearInterval(faceCheckRef.current);
  }, [cameraReady]);

  // ─── Camera status message ───────────────────────────────────────────────────
  const getCameraStatus = () => {
    if (!cameraReady) return { msg: 'Camera OFF — allow camera to continue.', ok: false };
    if (obstructed) return { msg: 'Camera obstructed — clear the lens.', ok: false };
    if (!faceVisible) return { msg: 'Face not detected — sit in front of camera.', ok: false };
    if (lookingAway) return { msg: 'Keep your eyes on the screen.', ok: false };
    return { msg: 'Camera OK — You may start.', ok: true };
  };

  const camStatus = getCameraStatus();
  useEffect(() => { setCameraStatus(camStatus.msg); }, [cameraReady, obstructed, faceVisible, lookingAway]);

  // ─── Load questions ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!camStatus.ok || questionsLoaded) return;
    const loadQ = async () => {
      try {
        const data = await apiFetch(`/ai/questions?role=${encodeURIComponent(role)}&difficulty=${encodeURIComponent(difficulty)}&count=${TOTAL}`);
        if (data.questions) {
          setQuestions(data.questions);
          setAnswers(new Array(data.questions.length).fill(''));
          setQuestionsLoaded(true);
          speak(data.questions[0]);
        }
      } catch (err) { console.error(err); }
    };
    loadQ();
  }, [camStatus.ok, questionsLoaded]);

  // ─── Fullscreen ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (camStatus.ok && questionsLoaded && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => { });
    }
  }, [camStatus.ok, questionsLoaded]);

  // ─── TTS (natural voice) ─────────────────────────────────────────────────────
  const speak = (text) => {
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.95;
      u.pitch = 1;
      const voices = speechSynthesis.getVoices();
      const preferred =
        voices.find(v => v.name === 'Google UK English Female') ||
        voices.find(v => v.name === 'Google US English') ||
        voices.find(v => v.lang === 'en-US' && !v.name.toLowerCase().includes('espeak')) ||
        voices.find(v => v.lang.startsWith('en')) ||
        voices[0];
      if (preferred) u.voice = preferred;
      speechSynthesis.speak(u);
    } catch { }
  };

  // ─── Speech recognition ──────────────────────────────────────────────────────
  const startRecording = () => {
    if (!camStatus.ok) { alert('Your face must be visible before starting.'); return; }
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) { alert('Speech recognition not supported. Use Chrome.'); return; }
    speechSynthesis.cancel();
    const rec = new SpeechRec();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';
    rec.onresult = (ev) => {
      let text = '';
      for (let i = ev.resultIndex; i < ev.results.length; i++) text += ev.results[i][0].transcript;
      setAnswerText(text);
    };
    rec.onerror = (err) => console.warn('recognizer error', err);
    rec.start();
    recognizerRef.current = rec;
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (recognizerRef.current) {
      try { recognizerRef.current.stop(); } catch { }
      recognizerRef.current = null;
    }
    setAnswers(prev => { const n = [...prev]; n[current] = answerText; return n; });
    setIsRecording(false);
  };

  const nextQuestion = () => {
    stopRecording();
    const next = current + 1;
    setCurrent(next);
    setAnswerText('Press Start to speak…');
    if (questions[next]) setTimeout(() => speak(questions[next]), 400);
  };

  const submitAll = async () => {
    stopRecording();
    cleanupSession();
    const finalAnswers = [...answers];
    finalAnswers[current] = answerText;
    try {
      const data = await apiFetch('/interviews/submit', {
        method: 'POST',
        body: JSON.stringify({ role, difficulty, questions, answers: finalAnswers })
      });
      if (data.session_id) navigate(`/interview-result/${data.session_id}`, { replace: true });
    } catch (err) { alert('Submit failed: ' + err.message); }
  };

  const handleExitInterview = () => {
    const ok = window.confirm('Exit interview? Camera will stop and your progress will be lost.');
    if (!ok) return;
    cleanupSession();
    navigate('/interview-select', { replace: true });
  };

  const canStart = camStatus.ok && questions.length > 0 && !isRecording;

  return (
    <div className="page-container">
      <div className="flex justify-between items-center mb-4">
        <div className="text-accent font-bold" style={{ fontSize: 18 }}>
          Live Interview — {role} ({difficulty})
        </div>
        <button
          onClick={handleExitInterview}
          style={{ fontSize: 13, padding: '7px 14px', background: 'rgba(255,107,107,0.12)', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}
        >
          Exit Interview
        </button>
      </div>

      <div className="interview-layout">
        {/* Camera Panel */}
        <div className="interview-left">
          <video ref={videoRef} autoPlay playsInline muted className="interview-video" />
          <p style={{ marginTop: 10, fontWeight: 600, color: camStatus.ok ? 'var(--secondary)' : '#f59e0b', fontSize: 14 }}>
            {cameraStatus}
          </p>
          {!camStatus.ok && (
            <div style={{ marginTop: 8, padding: '10px 14px', borderRadius: 10, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', fontSize: 13, color: '#f59e0b' }}>
              Your face must be clearly visible to start the interview. Position yourself in front of the camera.
            </div>
          )}
          <p className="text-sm text-muted" style={{ marginTop: 8 }}>Camera must be ON and face visible throughout.</p>

          <div className="progress-dots mt-4">
            {Array.from({ length: TOTAL }).map((_, i) => (
              <div key={i} className={`dot ${i === current ? 'active' : ''}`} />
            ))}
          </div>
          <div className="text-sm text-muted mt-2">Question {current + 1} of {TOTAL}</div>
        </div>

        {/* Question / Answer Panel */}
        <div className="interview-right">
          <div className="glass-card" style={{ minHeight: 80, fontSize: 17, color: 'var(--on-surface)', lineHeight: 1.6 }}>
            {questions.length
              ? `Q${current + 1}. ${questions[current]}`
              : camStatus.ok ? 'Loading questions…' : 'Waiting for camera validation…'}
          </div>

          <div className="glass-card mt-4" style={{ minHeight: 110, color: 'var(--on-surface)', lineHeight: 1.6, fontSize: 15, whiteSpace: 'pre-wrap' }}>
            {answerText}
          </div>

          <div className="interview-controls mt-4">
            {canStart && <button className="btn-cta" onClick={startRecording}>Start Speaking</button>}
            {isRecording && (
              <button className="btn-cta-outline" onClick={stopRecording} style={{ borderColor: '#ff6b6b', color: '#ff6b6b' }}>
                Stop
              </button>
            )}
            {!isRecording && questions.length > 0 && current < questions.length - 1 && (
              <button className="btn-cta-outline" onClick={nextQuestion}>Next Question</button>
            )}
            {!isRecording && current === questions.length - 1 && questions.length > 0 && (
              <button className="btn-cta" onClick={submitAll}>Submit All</button>
            )}
          </div>

          {!camStatus.ok && questions.length === 0 && (
            <div className="text-sm text-muted mt-4" style={{ fontStyle: 'italic' }}>
              Start button will appear once your face is detected.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
