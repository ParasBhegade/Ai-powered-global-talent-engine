<?php
// recommendations.php
// Final version — Groq integration, neon UI, moving bg, charts, voice TTS, robust fallback

session_start();
require "config.php"; // must provide $conn (mysqli) and $GROQ_API_KEY

// -----------------------------
// Helper: call Groq (AI) — returns parsed array or false
// -----------------------------
function ai_recommend_groq($career, $score, $total, $skills, $api_key) {
    if (empty($api_key) || !function_exists('curl_init')) return false;

    $prompt = "
You MUST return ONLY valid JSON — no markdown, no commentary, no extra text.
Return JSON exactly in this format:

{
  \"summary\": \"text\",
  \"weak_skills\": {\"Skill Name\": number, ...},
  \"learning_priority\": {\"Skill Name\": number, ...},
  \"improvement_points\": [\"point1\", \"point2\"],
  \"roadmap\": [\"Week 1: ...\",\"Week 2: ...\",\"Week 3: ...\",\"Week 4: ...\"],
  \"projects\": [\"project1\",\"project2\"]
}

User data:
Career: $career
Score: $score / $total
Skills: " . implode(", ", $skills) . "
";

    // Use a modern Groq model known to work; change if you have another recommended model
    $url = "https://api.groq.com/openai/v1/chat/completions";
    $payload = [
        "model" => "llama-3.3-70b-versatile",
        "messages" => [
            ["role" => "system", "content" => "You output ONLY strict JSON, nothing else."],
            ["role" => "user", "content" => $prompt]
        ],
        "temperature" => 0.0,
        "max_tokens" => 700
    ];

    $headers = [
        "Content-Type: application/json",
        "Authorization: " . "Bearer " . $api_key
    ];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 20);

    $response = curl_exec($ch);
    $err = curl_error($ch);
    curl_close($ch);

    if ($err || !$response) return false;

    $resp = json_decode($response, true);
    if (!is_array($resp)) return false;

    // try common Groq / OpenAI variants
    $content = $resp['choices'][0]['message']['content'] ?? $resp['choices'][0]['text'] ?? null;
    if (!$content) return false;

    $raw = trim($content);
    // remove ```json fences if present
    $raw = preg_replace('/^```(?:json)?\s*/i', '', $raw);
    $raw = preg_replace('/\s*```$/i', '', $raw);

    // try direct decode
    $parsed = json_decode($raw, true);
    if (json_last_error() === JSON_ERROR_NONE && is_array($parsed)) return $parsed;

    // If parse failed, try to extract largest JSON object substring
    if (preg_match('/\{(?:[^{}]|(?R))*\}/s', $raw, $m)) {
        $maybe = $m[0];
        $p2 = json_decode($maybe, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($p2)) return $p2;
    }

    return false;
}

// -----------------------------
// Validate request params
// -----------------------------
if (!isset($_GET['path']) || !isset($_GET['score']) || !isset($_GET['total'])) {
    die("<h2 style='color:red;text-align:center;margin-top:40px;'>❌ Invalid access. Missing required parameters.</h2>");
}

$path_id = (int)$_GET['path'];
$score = (int)$_GET['score'];
$total = (int)$_GET['total'];
$percentage = ($total > 0) ? round(($score/$total)*100, 1) : 0;

// -----------------------------
// Fetch career path and skills
// -----------------------------
$career_name = "Career Path";
$career_q = mysqli_query($conn, "SELECT * FROM career_paths WHERE id=" . intval($path_id) . " LIMIT 1");
if ($career_q && mysqli_num_rows($career_q) > 0) {
    $career_row = mysqli_fetch_assoc($career_q);
    $career_name = $career_row['name'] ?? $career_name;
}

// Load skills list
$skill_list = [];
$skills_q = mysqli_query($conn, "SELECT skill_name FROM skills WHERE career_path_id=" . intval($path_id));
if ($skills_q) {
    while ($s = mysqli_fetch_assoc($skills_q)) $skill_list[] = $s['skill_name'];
}

// -----------------------------
// Call AI (Groq) — fallback to stable local generator if fails
// -----------------------------
$ai = false;
if (!empty($GROQ_API_KEY)) {
    $ai = ai_recommend_groq($career_name, $score, $total, $skill_list, $GROQ_API_KEY);
}

// Strong fallback detection — if AI failed or returned garbage, create local fallback
if (
    !is_array($ai) ||
    !isset($ai['summary']) ||
    strlen(trim((string)$ai['summary'])) < 8 ||
    (is_string($ai['summary']) && stripos($ai['summary'], 'AI could not') !== false)
) {
    // Build fallback weak skills and priorities from DB (simple heuristic)
    $fallback_weak = [];
    $fallback_priority = [];
    if (!empty($skill_list)) {
        $n = count($skill_list);
        foreach ($skill_list as $i => $sk) {
            // priority: higher for earlier items
            $priority = max(20, (int)(70 - ($i * (50/$n))));
            $fallback_priority[$sk] = $priority;
            $fallback_weak[$sk] = max(8, (int)(40 - ($i * (30/$n))));
        }
    } else {
        $fallback_weak = ["Fundamentals" => 35, "Practice" => 25];
        $fallback_priority = ["Fundamentals" => 60, "Projects" => 40];
    }

    $improvement_points = [
        "Revise core fundamentals for 20–30 minutes daily.",
        "Follow one structured tutorial focused on your weakest skill and build a mini-project.",
        "Practice debugging and add basic unit tests to small projects.",
        "Use Git for version control and push regular commits."
    ];

    $roadmap = [
        "Week 1: Strengthen fundamentals + short exercises (30 min/day).",
        "Week 2: Follow tutorial and implement a focused mini-project.",
        "Week 3: Add tests, debug, and document your code.",
        "Week 4: Polish project, record a short demo, and seek feedback."
    ];

    $projects = [
        "Mini CRUD app with persistent storage and Git tracking.",
        "REST API with simple authentication and documented endpoints.",
        "Small data dashboard that reads CSV and visualizes insights."
    ];

    $ai = [
        "summary" => "Here is a personalized performance summary generated for you.",
        "weak_skills" => $fallback_weak,
        "learning_priority" => $fallback_priority,
        "improvement_points" => $improvement_points,
        "roadmap" => $roadmap,
        "projects" => $projects
    ];
}

// Ensure keys exist
$ai['weak_skills'] = $ai['weak_skills'] ?? [];
$ai['learning_priority'] = $ai['learning_priority'] ?? [];
$ai['improvement_points'] = $ai['improvement_points'] ?? [];
$ai['roadmap'] = $ai['roadmap'] ?? [];
$ai['projects'] = $ai['projects'] ?? [];

// Prepare quick top focus
$priority_sorted = $ai['learning_priority'];
arsort($priority_sorted);
$top_focus = array_slice($priority_sorted, 0, 6, true);

// Convert arrays to JS-safe values
$radar_labels = array_keys($ai['weak_skills']);
$radar_values = array_values($ai['weak_skills']);
$priority_labels = array_keys($ai['learning_priority']);
$priority_values = array_values($ai['learning_priority']);
$roadmap_labels = $ai['roadmap'];
$improvement_points = $ai['improvement_points'];
$projects = $ai['projects'];

?>
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>AI Recommendations — <?= htmlspecialchars($career_name) ?></title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<style>
/* ---------- Moving background & palette ---------- */
:root{
    --accent1:#00eaff;
    --accent2:#8a2be2;
    --muted:#bfefff;
}
html,body{height:100%; margin:0; font-family:Inter, Poppins, system-ui, sans-serif; color:#e6f7ff;}
body {
    background: linear-gradient(120deg, #001826, #002b3f, #051a2f);
    background-size: 400% 400%;
    animation: bgFlow 14s ease-in-out infinite;
    padding:22px 12px;
}
@keyframes bgFlow { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }

/* ---------- Layout ---------- */
.container { max-width:1250px; margin:0 auto; display:grid; grid-template-columns: 1fr 380px; gap:22px; align-items:start; }
.header { grid-column:1 / -1; display:flex; justify-content:space-between; align-items:center; gap:16px; margin-bottom:8px; }
.brand { display:flex; gap:12px; align-items:center; }
.logo { width:52px; height:52px; border-radius:12px; background:linear-gradient(135deg,var(--accent1),var(--accent2)); display:flex; align-items:center; justify-content:center; color:#001; font-weight:900; box-shadow:0 8px 36px rgba(0,0,0,0.55); }
.title { color:var(--accent1); font-weight:800; font-size:20px; }
.subtitle { color:var(--muted); font-size:13px; margin-top:4px; }

/* buttons */
.btn {
    display:inline-block; padding:10px 14px; border-radius:12px;
    background: linear-gradient(90deg,var(--accent1),var(--accent2)); color:#001; font-weight:800; text-decoration:none;
    box-shadow: 0 10px 30px rgba(0,0,0,0.45);
}

/* cards */
.card{ background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); padding:18px; border-radius:14px; border:1px solid rgba(255,255,255,0.03); box-shadow: 0 12px 40px rgba(0,0,0,0.6); }
.h-title { color:var(--accent1); font-size:18px; font-weight:800; margin:0 0 8px 0; }
.small { color:var(--muted); font-size:13px; margin-top:4px; }

/* grid main */
.main-col { display:flex; flex-direction:column; gap:18px; }

/* visual grid */
.visual-grid { display:grid; grid-template-columns: 1fr 1fr; gap:14px; align-items:stretch; margin-top:12px; }
canvas { width:100% !important; height:320px !important; background: linear-gradient(180deg, rgba(0,0,0,0.06), rgba(255,255,255,0.01)); border-radius:12px; padding:10px; }

/* quick summary right column */
.skill-row { display:flex; gap:12px; align-items:center; margin:10px 0; }
.skill-name { width:160px; color:#cfefff; font-weight:700; }
.skill-bar { flex:1; height:14px; background: rgba(255,255,255,0.03); border-radius:999px; overflow:hidden; position:relative; }
.skill-fill { height:100%; border-radius:999px; transform: translateX(-100%); }

/* roadmap boxes */
.roadmap-grid { display:flex; gap:12px; margin-top:12px; flex-wrap:wrap; }
.roadmap-item { flex:1 1 200px; padding:12px; border-radius:10px; background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.03)); border:1px solid rgba(255,255,255,0.02); color:#dffaff; }

/* improv list */
.impr-list { margin:10px 0 0 18px; color:#dffaff; }

/* tts controls */
#tts-controls { margin-top:12px; }
#tts-controls .btn-small { padding:8px 10px; border-radius:8px; font-weight:800; background:linear-gradient(90deg,var(--accent1),var(--accent2)); color:#001; border:none; cursor:pointer; margin-right:8px;}
#tts-controls select, #tts-controls input[type="range"] { background: rgba(255,255,255,0.03); color:#dffaff; border-radius:8px; padding:6px; border:1px solid rgba(255,255,255,0.02); }

/* responsive */
@media (max-width: 980px) { .container { grid-template-columns: 1fr; } .visual-grid { grid-template-columns:1fr; } canvas { height:260px !important; } .skill-name { width:120px; } }
/* Fix TTS Voice Dropdown Visibility */
#tts-voices {
    background: #0e1a33 !important;
    color: #d7e9ff !important;
    border: 1px solid #00eaff !important;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
}

#tts-voices option {
    background: #0e1a33 !important;
    color: #d7e9ff !important;
    padding: 10px;
    font-weight: 600;
    border-bottom: 1px solid rgba(255,255,255,0.06);
}

#tts-voices option:hover {
    background: #122244 !important;
    color: #00eaff !important;
}

</style>
</head>
<body>

<div class="container">

    <div class="header">
        <div class="brand">
            <div class="logo">AI</div>
            <div>
                <div class="title">AI Recommendation Engine</div>
                <div class="subtitle"><?= htmlspecialchars($career_name) ?> — Score: <?= $score ?>/<?= $total ?> (<?= $percentage ?>%)</div>
            </div>
        </div>

        <div style="display:flex;gap:8px;align-items:center;">
            <a class="btn" href="student_dashboard.php">⬅ Back to Dashboard</a>
          <!--   <a class="btn" href="tutorials.php?path=<?= intval($path_id) ?>">View Tutorials</a>-->
        </div>
    </div>

    <!-- Left: main column -->
    <div class="main-col">

        <!-- Performance Summary + TTS controls -->
        <div class="card">
            <div class="h-title">Performance Summary</div>
            <div class="small">Auto-generated by AI — concise assessment and action plan.</div>

            <!-- summary (marked for TTS) -->
            <p id="ai-summary" data-tts="true" style="margin-top:12px; color:#dff7ff;"><?= nl2br(htmlspecialchars($ai['summary'])) ?></p>

            <!-- TTS Controls -->
            <div id="tts-controls">
                <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:8px;">
                    <button id="tts-play" class="btn-small">🔊 Listen</button>
                    <button id="tts-pause" class="btn-small" disabled>⏸ Pause</button>
                    <button id="tts-resume" class="btn-small" disabled>▶ Resume</button>
                    <button id="tts-stop" class="btn-small" disabled>⏹ Stop</button>

                    <label style="color:#bfefff;margin-left:6px;">Voice</label>
                    <select id="tts-voices" style="min-width:220px"></select>

                    <label style="color:#bfefff;margin-left:6px;">Rate</label>
                    <input id="tts-rate" type="range" min="0.6" max="1.6" step="0.1" value="1">

                    <label style="color:#bfefff;margin-left:6px;">Pitch</label>
                    <input id="tts-pitch" type="range" min="0.6" max="2.0" step="0.1" value="1">

                    <label style="color:#bfefff;margin-left:6px;">Highlight</label>
                    <input id="tts-highlight" type="checkbox" checked>
                </div>
                <div id="tts-status" style="margin-top:8px;color:#a6e6ff;font-size:13px;"></div>
            </div>
        </div>

        <!-- What to improve -->
        <div class="card">
            <div class="h-title">What to Improve (AI Suggestions)</div>
            <div class="small">Clear, prioritized points to focus on.</div>
            <ul class="impr-list">
                <?php foreach ($improvement_points as $pt): ?>
                    <li data-tts="true" style="margin:8px 0;"><?= htmlspecialchars($pt) ?></li>
                <?php endforeach; ?>
            </ul>
        </div>

        <!-- Visual Insights -->
        <div class="card">
            <div class="h-title">Visual Insights</div>
            <div class="small">Weak skills, learning priorities, and 30-day roadmap.</div>

            <div class="visual-grid" style="margin-top:12px;">
                <div>
                    <div style="font-weight:700;color:#9ff7ff;margin-bottom:8px;">Weak Skills (Radar)</div>
                    <canvas id="radarChart"></canvas>
                </div>

                <div>
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <div style="font-weight:700;color:#9ff7ff">Learning Priority (Bar)</div>
                        <div style="color:#bfefff;font-weight:800;">Top focus</div>
                    </div>
                    <canvas id="priorityChart" style="margin-top:10px;height:320px;"></canvas>
                </div>
            </div>

            <div style="margin-top:18px;">
                <div style="font-weight:700;color:#9ff7ff;margin-bottom:8px;">30-Day Roadmap (AI)</div>
                <div class="roadmap-grid">
                    <?php foreach ($roadmap_labels as $r): ?>
                        <div class="roadmap-item"><?= htmlspecialchars($r) ?></div>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>

        <!-- Projects -->
        <div class="card">
            <div class="h-title">Mini Projects Suggested by AI</div>
            <div class="small">Hands-on projects to apply your learning.</div>
            <ul style="margin-top:12px;">
                <?php foreach ($projects as $p): ?>
                    <li style="margin:8px 0;color:#dffaff" data-tts="true"><?= htmlspecialchars($p) ?></li>
                <?php endforeach; ?>
            </ul>
        </div>

    </div>

    <!-- Right column: Quick summary & bars -->
    <div>
        <div class="card">
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <div>
                    <div style="font-weight:900;color:var(--accent1);font-size:16px">Quick Summary</div>
                    <div class="small">Snapshot & top focus</div>
                </div>
            </div>

            <div style="margin-top:12px;">
                <div style="display:flex;justify-content:space-between;"><div style="color:#cfefff">Score</div><div style="font-weight:900"><?= $score ?>/<?= $total ?> (<?= $percentage ?>%)</div></div>
                <div style="height:12px;background:rgba(255,255,255,0.03);border-radius:999px;margin-top:8px;overflow:hidden;">
                    <?php $bar_pct = max(0,min(100, (int)$percentage )); ?>
                    <div style="width:<?= $bar_pct ?>%; height:100%; background:linear-gradient(90deg,var(--accent1),var(--accent2)); transition:width 900ms;"></div>
                </div>
            </div>

            <div style="margin-top:18px;">
                <div style="font-weight:800;color:var(--accent1);margin-bottom:8px">Top Focus Areas</div>
                <?php foreach ($top_focus as $sk => $val): ?>
                    <div class="skill-row">
                        <div class="skill-name"><?= htmlspecialchars($sk) ?></div>
                        <div class="skill-bar"><div class="skill-fill" style="width:<?= max(6, min(100, intval($val))) ?>%; background:linear-gradient(90deg,var(--accent1),var(--accent2));"></div></div>
                    </div>
                <?php endforeach; ?>
            </div>

            <div style="margin-top:16px;">
                <div style="font-weight:800;color:var(--accent1);">Fast Tips</div>
                <ul style="margin-top:8px;color:#dffaff;">
                    <li>Practice 30-min daily on one weak skill.</li>
                    <li>Build & ship small projects weekly.</li>
                    <li>Document your work (README & demo).</li>
                </ul>
            </div>
        </div>

        <div class="card" style="margin-top:16px;">
            <div style="font-weight:800;color:var(--accent1);">Actions</div>
            <div style="margin-top:12px;">
                <a class="btn" href="tutorials.php?path=<?= intval($path_id) ?>" style="display:inline-block;text-decoration:none;">View Tutorials</a>
            </div>
        </div>
    </div>

</div>

<!-- Charts & UI scripts -->
<script>
// Data from PHP
const radarLabels = <?= json_encode($radar_labels) ?: '[]' ?>;
const radarData = <?= json_encode($radar_values) ?: '[]' ?>;
const pLabels = <?= json_encode($priority_labels) ?: '[]' ?>;
const pData = <?= json_encode($priority_values) ?: '[]' ?>;

// Radar chart
const rCtx = document.getElementById('radarChart').getContext('2d');
const radarChart = new Chart(rCtx, {
    type: 'radar',
    data: {
        labels: radarLabels,
        datasets: [{
            label: 'Weak Skills',
            data: radarData,
            backgroundColor: 'rgba(0,234,255,0.12)',
            borderColor: '#00eaff',
            borderWidth: 2,
            pointBackgroundColor: '#8a2be2'
        }]
    },
    options: {
        responsive:true,
        scales: {
            r: {
                ticks: { color: '#bfefff', beginAtZero:true, max:100 },
                pointLabels: { color: '#dffaff' }
            }
        },
        plugins: { legend: { display: false } },
        animation: { duration: 1000, easing: 'easeOutQuart' }
    }
});

// Priority bar (horizontal)
const pCtx = document.getElementById('priorityChart').getContext('2d');
const priorityChart = new Chart(pCtx, {
    type: 'bar',
    data: {
        labels: pLabels,
        datasets: [{
            label: 'Priority',
            data: pData,
            backgroundColor: pLabels.map((_,i) => i%2 ? 'rgba(138,43,226,0.92)' : 'rgba(0,234,255,0.92)'),
            borderRadius: 8,
            barThickness: 18
        }]
    },
    options: {
        indexAxis: 'y',
        responsive:true,
        plugins: { legend: { display: false } },
        scales: {
            x: { ticks: { color: '#bfefff' }, beginAtZero:true, max:100, grid: { color: 'rgba(255,255,255,0.03)' } },
            y: { ticks: { color: '#dffaff' } }
        },
        animation: { duration: 1000, easing: 'easeOutQuart' }
    }
});

// Animate skill fills
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.skill-fill').forEach((el, idx) => {
        el.style.transform = 'translateX(-100%)';
        setTimeout(()=> {
            el.style.transition = 'transform 800ms cubic-bezier(.2,.9,.3,1), width 900ms ease';
            el.style.transform = 'translateX(0)';
        }, 120 * idx);
    });

    // reveal roadmap items
    document.querySelectorAll('.roadmap-item').forEach((el, i) => {
        el.style.opacity = 0;
        setTimeout(()=> { el.style.transition = 'all 500ms ease'; el.style.opacity = 1; el.style.transform = 'translateY(0)'; }, 120 * i);
    });
});
</script>

<!-- TTS (Web Speech) script -->
<style>
/* highlight while reading */
.tts-highlight { background: linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02)); padding:2px 4px; border-radius:4px; }
#tts-controls .btn-small[disabled] { opacity:0.5; cursor:not-allowed; }
</style>

<script>
(function(){
  const support = !!(window.speechSynthesis && window.SpeechSynthesisUtterance);
  const statusEl = document.getElementById('tts-status');
  const btnPlay = document.getElementById('tts-play');
  const btnPause = document.getElementById('tts-pause');
  const btnResume = document.getElementById('tts-resume');
  const btnStop = document.getElementById('tts-stop');
  const voicesSelect = document.getElementById('tts-voices');
  const rateInput = document.getElementById('tts-rate');
  const pitchInput = document.getElementById('tts-pitch');
  const highlightToggle = document.getElementById('tts-highlight');

  if (!support) {
    statusEl.textContent = "Speech synthesis not supported in this browser. Use Chrome/Edge/Safari.";
    btnPlay.disabled = true;
    return;
  }

  function $all(s){ return Array.from(document.querySelectorAll(s)); }

  // populate voices
  function loadVoices(){
    const voices = speechSynthesis.getVoices() || [];
    voicesSelect.innerHTML = '';
    voices.forEach((v,i) => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = v.name + ' — ' + v.lang + (v.default ? ' (default)' : '');
      voicesSelect.appendChild(opt);
    });
    if (voices.length === 0) {
      const opt = document.createElement('option');
      opt.textContent = 'No voices available';
      voicesSelect.appendChild(opt);
    }
  }
  speechSynthesis.onvoiceschanged = loadVoices;
  loadVoices();

  function collectItems(){
    const items = [];
    const summary = document.getElementById('ai-summary');
    if (summary && summary.textContent.trim()) items.push({el: summary, text: summary.textContent.trim()});
    $all('[data-tts="true"]').forEach(e => {
      if (e.id === 'ai-summary') return;
      const txt = e.textContent.trim();
      if (txt) items.push({el: e, text: txt});
    });
    return items;
  }

  let queue = [];
  let current = null;

  function enableControls(playing){
    btnPause.disabled = !playing;
    btnStop.disabled = !playing;
    btnResume.disabled = playing;
  }

  btnPlay.addEventListener('click', ()=> {
    const items = collectItems();
    if (!items.length) { statusEl.textContent = "Nothing found to read."; return; }
    queue = items.slice();
    const voiceIndex = parseInt(voicesSelect.value || 0);
    speakNext(voiceIndex);
  });

  function speakNext(voiceIndex){
    if (queue.length === 0) { statusEl.textContent = "✅ Finished reading."; enableControls(false); return; }
    const it = queue.shift();
    const utter = new SpeechSynthesisUtterance(it.text);
    const voices = speechSynthesis.getVoices();
    if (voices[voiceIndex]) utter.voice = voices[voiceIndex];
    utter.rate = parseFloat(rateInput.value || 1);
    utter.pitch = parseFloat(pitchInput.value || 1);
    if (highlightToggle.checked && it.el) { it.el.classList.add('tts-highlight'); it.el.scrollIntoView({behavior:'smooth', block:'center'}); }
    utter.onend = () => {
      if (it.el) it.el.classList.remove('tts-highlight');
      setTimeout(()=> speakNext(voiceIndex), 180);
    };
    utter.onerror = (e) => {
      console.error('TTS error', e);
      statusEl.textContent = "⚠️ TTS error.";
      enableControls(false);
    };
    speechSynthesis.speak(utter);
    current = utter;
    statusEl.textContent = "🔊 Reading…";
    enableControls(true);
  }

  btnPause.addEventListener('click', ()=> { if (speechSynthesis.speaking && !speechSynthesis.paused) { speechSynthesis.pause(); statusEl.textContent = "⏸ Paused"; btnResume.disabled = false; btnPause.disabled = true; } });
  btnResume.addEventListener('click', ()=> { if (speechSynthesis.paused) { speechSynthesis.resume(); statusEl.textContent = "▶ Resumed"; btnResume.disabled = true; btnPause.disabled = false; } });
  btnStop.addEventListener('click', ()=> { speechSynthesis.cancel(); $all('.tts-highlight').forEach(e=>e.classList.remove('tts-highlight')); statusEl.textContent = "⏹ Stopped"; enableControls(false); });

  // keyboard: space toggles play/pause (except when typing)
  document.addEventListener('keydown', function(e){
    const tag = (document.activeElement || {}).tagName || '';
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
    if (e.code === 'Space') { e.preventDefault(); if (!speechSynthesis.speaking) btnPlay.click(); else if (speechSynthesis.paused) btnResume.click(); else btnPause.click(); }
  });

})();
</script>

</body>
</html>
