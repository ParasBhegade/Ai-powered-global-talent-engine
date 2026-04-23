<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit;
}

$role = $_GET['role'] ?? "Web Developer";
$difficulty = $_GET['difficulty'] ?? "Beginner";
$count = 5;
?>
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Live AI Interview — Camera & Eye Check</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
/* BG2 — Dark Neon Blue moving background */
:root{
  --accent1:#00d4ff;
  --accent2:#7b39ff;
  --bg1:#041022;
  --bg2:#001435;
}
body{
  margin:0;
  font-family:Poppins,system-ui,Segoe UI,Roboto,'Helvetica Neue',Arial;
  color:#e6f6ff;
  background: linear-gradient(120deg,var(--bg1),#00112a 40%, #07112a 60%, #020617);
  background-size: 300% 300%;
  animation: bgMove 16s ease infinite;
  -webkit-font-smoothing:antialiased;
  -moz-osx-font-smoothing:grayscale;
}
@keyframes bgMove{
  0%{background-position:0% 50%}
  50%{background-position:100% 50%}
  100%{background-position:0% 50%}
}

.container{max-width:1200px;margin:22px auto;padding:18px}
.header{display:flex;justify-content:space-between;align-items:center;gap:12px}
.title{font-size:20px;color:var(--accent1);font-weight:700}
.btn-back{
  background:linear-gradient(90deg,var(--accent1),var(--accent2));
  padding:9px 14px;border-radius:10px;color:#001; font-weight:700; text-decoration:none;
  box-shadow:0 6px 20px rgba(59,45,120,0.12);
}

/* layout */
.main{display:flex;gap:20px;margin-top:18px}
.left, .right{background:rgba(255,255,255,0.03);border-radius:14px;padding:18px;border:1px solid rgba(255,255,255,0.04)}
.left{flex:0 0 42%}
.right{flex:1}

/* video / status */
#camera{width:100%;height:auto;border-radius:12px;border:3px solid rgba(123,57,255,0.25);background:#000}
#cameraStatus{margin-top:10px;font-weight:600;color:#ffd7d7}

/* question / answer */
.question{background:linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));padding:14px;border-radius:10px;min-height:86px;font-size:18px;color:#dcefff}
.answer{background:rgba(255,255,255,0.02);padding:12px;border-radius:10px;min-height:110px;margin-top:12px;color:#eaf6ff}

/* controls */
.controls{margin-top:14px;display:flex;gap:10px;flex-wrap:wrap}
.btn{
  padding:10px 16px;border-radius:10px;border:0;cursor:pointer;font-weight:700;color:#001;
  background:linear-gradient(90deg,var(--accent1),var(--accent2));
  box-shadow:0 8px 24px rgba(59,45,120,0.12);
}
.btn-muted{background:rgba(255,255,255,0.06);color:#dbeeff}

/* small */
.small{font-size:13px;color:#bcdfff;margin-top:8px}

/* progress */
.progress{margin-top:12px}
.progress .dot{display:inline-block;width:12px;height:12px;border-radius:50%;background:rgba(255,255,255,0.08);margin-right:6px}
.progress .dot.active{background:linear-gradient(90deg,var(--accent1),var(--accent2))}

/* responsive */
@media(max-width:920px){
  .main{flex-direction:column}
  .left{order:2}
  .right{order:1}
}
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <div class="title">🎯 Live Interview — <?=htmlspecialchars($role)?> (<?=htmlspecialchars($difficulty)?>)</div>
    <div style="display:flex;gap:10px;align-items:center">
      <div class="small">User: <?=htmlspecialchars($_SESSION['user_id'])?></div>
      <a href="student_dashboard.php" class="btn-back">🏠 Dashboard</a>
    </div>
  </div>

  <div class="main">
    <div class="left">
      <video id="camera" autoplay playsinline muted></video>
      <p id="cameraStatus">Initializing camera…</p>
      <p class="small">Camera must be ON and your face visible. If camera is blocked, interview will not start.</p>
    </div>

    <div class="right">
      <div id="questionCard" class="question">Waiting for camera & face validation...</div>
      <div id="answerText" class="answer">Press Start to speak — your speech will appear here.</div>

      <div class="controls">
        <button id="startBtn" class="btn btn-muted" style="display:none">Start Speaking</button>
        <button id="stopBtn" class="btn btn-muted" style="display:none">Stop</button>
        <button id="nextBtn" class="btn btn-muted" style="display:none">Next Question</button>
        <button id="submitAll" class="btn btn-muted" style="display:none">Submit All</button>
      </div>

      <div id="progress" class="progress"></div>
      <div id="statusSmall" class="small" style="margin-top:10px"></div>
    </div>
  </div>
</div>

<script>
/* ============================
   Final interview_live.php (B) 
   - camera + face + eye checks
   - echo fixes (AEC + stop TTS when mic starts)
   - auto-speak after camera OK
   ============================ */

/* ---------- DOM ---------- */
const camera = document.getElementById('camera');
const cameraStatus = document.getElementById('cameraStatus');
const questionCard = document.getElementById('questionCard');
const answerText = document.getElementById('answerText');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const nextBtn = document.getElementById('nextBtn');
const submitAll = document.getElementById('submitAll');
const progress = document.getElementById('progress');
const statusSmall = document.getElementById('statusSmall');

/* ---------- State ---------- */
let cameraReady = false;
let faceVisible = false;
let obstructed = false;
let lookingAway = false;
let questions = [];
let answers = [];
let current = 0;
const TOTAL = <?= intval($count) ?>;
const role = <?= json_encode($role) ?>;
const difficulty = <?= json_encode($difficulty) ?>;

/* ---------- SpeechRecognition prefixed ---------- */
const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition || null;

/* ---------- Start media with echo cancellation options ---------- */
async function initCamera(){
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
    });
    camera.srcObject = stream;
    cameraReady = true;
    updateCameraStatus();
  } catch (e) {
    cameraReady = false;
    updateCameraStatus();
    alert("Camera / Microphone access required. Please allow permissions.");
  }
}
initCamera();

/* ---------- Face & obstruction & eye-check (lightweight) ---------- */
function analyzeFrame() {
  try {
    if (!cameraReady || camera.videoWidth === 0) return;
    const w = camera.videoWidth, h = camera.videoHeight;
    const cvs = document.createElement('canvas');
    cvs.width = w; cvs.height = h;
    const ctx = cvs.getContext('2d');
    ctx.drawImage(camera,0,0,w,h);
    const data = ctx.getImageData(0,0,w,h).data;
    let bright=0;
    const totalPixels = data.length/4;
    // brightness count
    for (let i=0;i<data.length;i+=4){
      const r=data[i], g=data[i+1], b=data[i+2];
      if (r>60 && g>60 && b>60) bright++;
    }
    // obstruction if too dark / covered
    obstructed = bright < totalPixels * 0.02;
    // face visible if sufficiently many bright pixels (simple heuristic)
    faceVisible = bright > totalPixels * 0.08;

    // simple eye/face lateral brightness check to estimate looking-away:
    let left=0,right=0;
    const y1 = Math.floor(h*0.28), y2 = Math.floor(h*0.72);
    for (let y=y1; y<y2; y++){
      for (let x=0; x<w; x++){
        const idx = (y*w + x)*4;
        const sum = data[idx]+data[idx+1]+data[idx+2];
        if (x < w/2) left += sum; else right += sum;
      }
    }
    // if left-right imbalance is large => likely looking sideways
    const lrSum = left+right;
    lookingAway = (Math.abs(left-right) > lrSum * 0.28);

    updateCameraStatus();
  } catch (err) {
    console.warn('analyzeFrame error', err);
  }
}

/* Run analysis periodically */
setInterval(()=>{ if (cameraReady) analyzeFrame(); }, 600);

/* ---------- UI status update ---------- */
function updateCameraStatus(){
  if (!cameraReady){
    cameraStatus.innerText = "⛔ Camera OFF — allow camera to continue.";
    startBtn.style.display = 'none';
    statusSmall.innerText = '';
    return;
  }
  if (obstructed){
    cameraStatus.innerText = "⛔ Camera obstructed — clear the lens.";
    startBtn.style.display = 'none';
    statusSmall.innerText = '';
    return;
  }
  if (!faceVisible){
    cameraStatus.innerText = "⚠ Face not detected — sit in front of camera.";
    startBtn.style.display = 'none';
    statusSmall.innerText = '';
    return;
  }
  if (lookingAway){
    cameraStatus.innerText = "⚠ Keep your eyes on the screen.";
    startBtn.style.display = 'none';
    statusSmall.innerText = '';
    return;
  }
  cameraStatus.innerText = "✅ Camera OK — You may start.";
  startBtn.style.display = 'inline-block';
  statusSmall.innerText = '';
}

/* ---------- Fetch questions (after camera OK) ---------- */
let questionsLoaded = false;
function loadQuestionsAndAutoSpeak(){
  if (questionsLoaded) return;
  fetch(`get_question.php?role=${encodeURIComponent(role)}&difficulty=${encodeURIComponent(difficulty)}&count=${TOTAL}`)
  .then(r => r.json())
  .then(data => {
    if (!data.questions || !Array.isArray(data.questions)) {
      questionCard.innerText = "Failed to load questions.";
      return;
    }
    questions = data.questions;
    answers = new Array(questions.length).fill('');
    questionsLoaded = true;
    showQuestion(0);
    // Auto-speak first Q — at this moment mic is still OFF (Start not pressed)
    // add short delay to ensure users see camera status change
    setTimeout(()=>{ speak(questions[0]); }, 600);
  })
  .catch(err => {
    console.error(err);
    questionCard.innerText = "Failed to load questions.";
  });
}

/* Watch camera status and load questions when all OK */
setInterval(()=>{ if (cameraReady && faceVisible && !obstructed && !lookingAway) loadQuestionsAndAutoSpeak(); }, 900);

/* ---------- Render question / progress ---------- */
function showQuestion(i){
  current = i;
  questionCard.innerText = `Q${i+1}. ${questions[i]}`;
  answerText.innerText = answers[i] || "Press Start to answer…";
  nextBtn.style.display = (i < questions.length-1) ? 'inline-block':'none';
  submitAll.style.display = (i === questions.length-1) ? 'inline-block':'none';
  renderProgress();
}

function renderProgress(){
  progress.innerHTML = '';
  for (let i=0;i<TOTAL;i++){
    const d = document.createElement('span');
    d.className = 'dot' + (i===current ? ' active' : '');
    progress.appendChild(d);
  }
}

/* ---------- TTS ---------- */
function speak(text){
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95; u.pitch = 1;
    window.speechSynthesis.speak(u);
  } catch(e){ console.warn('TTS error', e); }
}

/* ---------- Speech recognition (start/stop) ---------- */
let recognizer = null;
function startRecognition(){
  if (!SpeechRec) { alert('SpeechRecognition not supported in this browser. Use Chrome.'); return; }

  // Ensure any TTS playing stops before starting mic (prevents TTS->mic echo)
  try { window.speechSynthesis.cancel(); } catch(e){}

  recognizer = new SpeechRec();
  recognizer.continuous = true;
  recognizer.interimResults = true;
  recognizer.lang = 'en-US';

  recognizer.onresult = (ev) => {
    let text = '';
    for (let i = ev.resultIndex; i < ev.results.length; i++){
      text += ev.results[i][0].transcript;
    }
    answerText.innerText = text;
  };
  recognizer.onerror = (err)=> console.warn('recognizer error',err);
  recognizer.start();

  startBtn.style.display = 'none';
  stopBtn.style.display = 'inline-block';
  statusSmall.innerText = 'Listening… (microphone active)';
}

function stopRecognition(){
  if (!recognizer) return;
  recognizer.stop();
  recognizer = null;
  answers[current] = answerText.innerText || '';
  statusSmall.innerText = 'Recording stopped';
  stopBtn.style.display = 'none';
  startBtn.style.display = 'inline-block';
  // capture: when user stops, we can auto-capture snapshot & (optionally) send for expression analysis in your batch API
}

/* ---------- Event wiring ---------- */
startBtn.addEventListener('click', ()=> {
  // do NOT call speak here — we already auto-spoke earlier after validation
  startRecognition();
});

stopBtn.addEventListener('click', ()=> {
  stopRecognition();
});

nextBtn.addEventListener('click', ()=> {
  // ensure we stop recognition before moving on
  if (recognizer) {
    try { recognizer.stop(); } catch(e){}
    recognizer = null;
  }
  answers[current] = answerText.innerText || '';
  showQuestion(current+1);

  // speak next question only when mic is not active
  setTimeout(()=>{ 
    if (!recognizer) speak(questions[current]); 
  }, 400);
});

submitAll.addEventListener('click', ()=> {
  answers[current] = answerText.innerText || '';
  // build payload; snapshots optional — you can extend to capture snapshots
  const payload = { role, difficulty, questions, answers, snapshots: [] };

  fetch('ai_interview_batch_api.php', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify(payload)
  })
  .then(r=>r.json())
  .then(json=>{
    if (json.error) { alert('Submit failed: '+json.error); return; }
    // redirect to result
    if (json.session_id) location.href = 'interview_result.php?session_id=' + encodeURIComponent(json.session_id);
    else alert('Saved. Session: ' + (json.session_id||'unknown'));
  })
  .catch(err=>{ console.error(err); alert('Submit network error'); });
});

/* ---------- Utility: ensure buttons disabled until questions loaded ---------- */
setInterval(()=>{
  // hide start if questions not loaded OR camera not OK
  if (!questions || questions.length===0 || !cameraReady || !faceVisible || obstructed || lookingAway) {
    startBtn.style.display = 'none';
  } else {
    // show start only if not currently recording
    if (!recognizer) startBtn.style.display = 'inline-block';
  }
}, 600);

/* ---------- initial placeholders ---------- */
questionCard.innerText = 'Waiting camera validation...';
answerText.innerText = 'Press Start to speak…';
renderProgress();

</script>
</body>
</html>

