import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

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
  
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const audioIntervalRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  const [cameraReady, setCameraReady] = useState(false);
  const [faceVisible, setFaceVisible] = useState(false);
  const [obstructed, setObstructed] = useState(false);
  const [lookingAway, setLookingAway] = useState(false);
  const [multipleFaces, setMultipleFaces] = useState(false);
  const [deviceDetected, setDeviceDetected] = useState(false);
  const [cameraStatus, setCameraStatus] = useState('Initializing camera…');

  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [audioCheatWarning, setAudioCheatWarning] = useState(false);
  const [cheatingFlag, setCheatingFlag] = useState(null);

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answerText, setAnswerText] = useState('Press Start to speak…');
  const [isRecording, setIsRecording] = useState(false);
  const [questionsLoaded, setQuestionsLoaded] = useState(false);
  const [faceModel, setFaceModel] = useState(null);
  const [objModel, setObjModel] = useState(null);

  // ─── Load Face & Object Detection Models ──────────────────────────────────────────────────
  useEffect(() => {
    const loadModels = async () => {
      try {
        await tf.ready();
        const [loadedFaceModel, loadedObjModel] = await Promise.all([
          blazeface.load(),
          cocoSsd.load()
        ]);
        setFaceModel(loadedFaceModel);
        setObjModel(loadedObjModel);
      } catch (err) {
        console.error("Failed to load models", err);
      }
    };
    loadModels();
  }, []);

  const isLight = theme === 'light';

  // ─── Full session cleanup ─────────────────────────────────────────────────────
  const cleanupSession = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch {}
    }
    // Stop all camera/mic tracks with a slight delay so MediaRecorder can finalize
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      setTimeout(() => tracks.forEach(t => t.stop()), 500);
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

        // --- Start Audio Analyser (Anti-cheating) ---
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        audioContextRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;

        // --- Initialize Media Recorder (Auto-save) ---
        const mime = MediaRecorder.isTypeSupported('video/webm; codecs=vp8,opus') ? 'video/webm; codecs=vp8,opus' : 'video/webm';
        const recorder = new MediaRecorder(stream, { mimeType: mime });
        mediaRecorderRef.current = recorder;
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            recordedChunksRef.current.push(e.data);
          }
        };
        recorder.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: mime });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = `interview_recording_${Date.now()}.webm`;
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
          }, 100);
        };
        // We will start the recorder when the user clicks "Start Speaking"
        
      } catch {
        setCameraReady(false);
        setCameraStatus('Camera OFF — allow camera to continue.');
        alert('Camera / Microphone access required. Please allow permissions.');
      }
    };
    initCamera();
  }, []);

  // ─── Face & Object detection (TensorFlow) ──────────────────────────────────────
  useEffect(() => {
    if (!cameraReady || !faceModel || !objModel) return;

    const analyzeFrame = async () => {
      const video = videoRef.current;
      if (!video || video.videoWidth === 0) return;
      
      try {
        const [facePredictions, objPredictions] = await Promise.all([
          faceModel.estimateFaces(video, false),
          objModel.detect(video)
        ]);
        
        const restrictedItems = ['cell phone', 'remote', 'book'];
        const hasDevice = objPredictions.some(p => restrictedItems.includes(p.class));
        setDeviceDetected(hasDevice);

        if (facePredictions.length === 0) {
          setFaceVisible(false);
          setObstructed(true); // Treat no face as obstructed/away
          setLookingAway(false);
          setMultipleFaces(false);
        } else if (facePredictions.length > 1) {
          setFaceVisible(false);
          setObstructed(false);
          setLookingAway(false);
          setMultipleFaces(true);
        } else {
          // Exactly 1 face
          setFaceVisible(true);
          setObstructed(false);
          setMultipleFaces(false);
          
          const landmarks = facePredictions[0].landmarks;
          if (landmarks) {
            const rightEye = landmarks[0];
            const leftEye = landmarks[1];
            const nose = landmarks[2];
            
            const eyeDist = Math.abs(leftEye[0] - rightEye[0]);
            const distRight = Math.abs(nose[0] - rightEye[0]);
            const distLeft = Math.abs(leftEye[0] - nose[0]);
            
            if (eyeDist > 0 && Math.min(distRight, distLeft) / eyeDist < 0.2) {
              setLookingAway(true);
            } else {
              setLookingAway(false);
            }
          } else {
            setLookingAway(false);
          }
        }
      } catch (e) {
        // Ignored
      }
    };
    faceCheckRef.current = setInterval(analyzeFrame, 400);
    return () => clearInterval(faceCheckRef.current);
  }, [cameraReady, faceModel, objModel]);

  // ─── Camera status message ───────────────────────────────────────────────────
  const getCameraStatus = () => {
    if (!cameraReady) return { msg: 'Camera OFF — allow camera to continue.', ok: false };
    if (deviceDetected) return { msg: 'Unauthorized device detected! Please put away your phone.', ok: false };
    if (obstructed) return { msg: 'Face not detected or camera obstructed.', ok: false };
    if (multipleFaces) return { msg: 'Multiple faces detected. Please be alone.', ok: false };
    if (!faceVisible) return { msg: 'Face not detected — sit in front of camera.', ok: false };
    if (lookingAway) return { msg: 'Keep your eyes on the screen.', ok: false };
    return { msg: 'Camera OK — You may start.', ok: true };
  };

  const camStatus = getCameraStatus();
  useEffect(() => { setCameraStatus(camStatus.msg); }, [cameraReady, obstructed, faceVisible, lookingAway, multipleFaces, deviceDetected]);

  // ─── Tab Switch & Audio Detection (Anti-Cheating) ────────────────────────────
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && cameraReady) {
        setTabSwitchCount(prev => {
          const newCount = prev + 1;
          if (newCount >= 5 && !cheatingFlag) {
            setCheatingFlag("Excessive Tab Switching");
            alert("Interview terminated automatically due to: Excessive Tab Switching (5 times).");
          } else if (newCount < 5) {
            alert(`Warning: Tab switch detected! (${newCount}/5). If you switch tabs 5 times, your interview will be terminated.`);
          }
          return newCount;
        });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [cameraReady, cheatingFlag]);

  // If cheatingFlag was set by Tab Switch, auto submit immediately
  useEffect(() => {
    if (cheatingFlag && isRecording) {
      stopRecording();
      submitAll(cheatingFlag);
    } else if (cheatingFlag && !isRecording && current === 0 && !questionsLoaded) {
      // Cheating before even starting, just exit
      cleanupSession();
      navigate('/dashboard', { replace: true });
    } else if (cheatingFlag && !isRecording) {
      submitAll(cheatingFlag);
    }
  }, [cheatingFlag]);

  useEffect(() => {
    if (!cameraReady || !analyserRef.current) return;
    const checkAudio = () => {
      if (isRecording) return; // User is answering, ignore volume
      const analyser = analyserRef.current;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
      const avg = sum / dataArray.length;
      if (avg > 35) setAudioCheatWarning(true);
      else setAudioCheatWarning(false);
    };
    audioIntervalRef.current = setInterval(checkAudio, 1000);
    return () => clearInterval(audioIntervalRef.current);
  }, [cameraReady, isRecording]);

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

  // ─── Fullscreen Enforcement ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isRecording) {
        alert("Warning: Fullscreen was exited! Please stay in fullscreen during the interview.");
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [isRecording]);

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
    if (!camStatus.ok) { alert('Your camera status must be OK before starting.'); return; }
    
    // Request fullscreen on explicit user gesture
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn("Fullscreen request failed:", err);
      });
    }

    // Start video recording if not already started
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
      recordedChunksRef.current = []; // Clear any old chunks just in case
      mediaRecorderRef.current.start(); // Start without timeslicing for a stable single-blob file
    }

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

  const submitAll = async (forceCheatingReason = null) => {
    stopRecording();
    cleanupSession();
    const finalAnswers = [...answers];
    finalAnswers[current] = answerText;
    
    // Resolve if reason was passed directly or from state
    const reason = typeof forceCheatingReason === 'string' ? forceCheatingReason : cheatingFlag;

    try {
      const data = await apiFetch('/interviews/submit', {
        method: 'POST',
        body: JSON.stringify({ role, difficulty, questions, answers: finalAnswers, cheatingReason: reason })
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
          {audioCheatWarning && (
            <div style={{ marginTop: 8, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', fontSize: 13, color: '#ff6b6b', fontWeight: 'bold' }}>
              ⚠️ Background audio detected! Ensure you are alone and no one is helping you.
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
