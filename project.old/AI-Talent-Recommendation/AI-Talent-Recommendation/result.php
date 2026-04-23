<?php
// result.php
session_start();
require 'config.php'; // must set $conn (mysqli)

// -----------------------------
// Auth
// -----------------------------
if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit;
}
$user_id = (int)$_SESSION['user_id'];

// -----------------------------
// Load result (GET result_id or latest)
// -----------------------------
$result_id = isset($_GET['result_id']) ? (int)$_GET['result_id'] : 0;
$result = null;

if ($result_id) {
    $stmt = $conn->prepare("SELECT * FROM user_scores WHERE id = ? AND user_id = ? LIMIT 1");
    $stmt->bind_param("ii", $result_id, $user_id);
    $stmt->execute();
    $result = $stmt->get_result()->fetch_assoc();
    $stmt->close();
}

// fallback -> latest for this user
if (!$result) {
    $stmt = $conn->prepare("SELECT * FROM user_scores WHERE user_id = ? ORDER BY created_at DESC LIMIT 1");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result()->fetch_assoc();
    $stmt->close();
}

if (!$result) {
    echo "<!doctype html><html><body style='font-family:Inter, Poppins, sans-serif; text-align:center; padding:60px; color:#223;'>No test result found. Please take a test first. <br><a href='student_dashboard.php'>Back to dashboard</a></body></html>";
    exit;
}

// -----------------------------
// Extract basic fields
// -----------------------------
$career_path_id = (int)$result['career_path_id'];
$score = (int)$result['score'];
$total = (int)$result['total'];
$percent = $total > 0 ? round($score / $total * 100, 1) : 0;
$created_at = $result['created_at'] ?? '';

// weak topics (comma-separated)
$weak_topics_raw = $result['weak_topics'] ?? '';
$weak_topics = array_values(array_filter(array_map('trim', explode(',', $weak_topics_raw))));

// -----------------------------
// Load career path
// -----------------------------
$career = ['id' => $career_path_id, 'name' => 'Career Path'];
$stmt = $conn->prepare("SELECT id, name, description FROM career_paths WHERE id = ? LIMIT 1");
$stmt->bind_param("i", $career_path_id);
$stmt->execute();
$res = $stmt->get_result();
if ($res && $res->num_rows > 0) {
    $career = $res->fetch_assoc();
}
$stmt->close();

// -----------------------------
// Load skills for radar chart
// -----------------------------
$skillNames = [];
$skillValues = [];
$stmt = $conn->prepare("SELECT skill_name, weight FROM skills WHERE career_path_id = ? ORDER BY weight DESC LIMIT 8");
$stmt->bind_param("i", $career_path_id);
$stmt->execute();
$res = $stmt->get_result();
if ($res) {
    while ($r = $res->fetch_assoc()) {
        $skillNames[] = $r['skill_name'];
        $skillValues[] = min(100, max(0, (int)$r['weight']));
    }
}
$stmt->close();

if (empty($skillNames)) {
    $skillNames = ['Fundamentals','Practical','Problem Solving','Algorithms','Database'];
    $skillValues = [60,50,40,30,45];
}

// -----------------------------
// Fetch tutorials (small sample)
// -----------------------------
$tutorials = [];
$stmt = $conn->prepare("SELECT id, title, url, summary FROM tutorials WHERE career_path_id = ? LIMIT 6");
$stmt->bind_param("i", $career_path_id);
$stmt->execute();
$res = $stmt->get_result();
while ($r = $res->fetch_assoc()) $tutorials[] = $r;
$stmt->close();

// -----------------------------
// Build learn list (based on weak topics -> skills matching)
// -----------------------------
$weak_skill_matches = [];
foreach ($weak_topics as $wt) {
    foreach ($skillNames as $sn) {
        if ($wt === '') continue;
        if (stripos($sn, $wt) !== false || stripos($wt, $sn) !== false) {
            $weak_skill_matches[] = $sn;
        }
    }
}
$weak_skill_matches = array_values(array_unique($weak_skill_matches));

$learn_list = [];
if (!empty($weak_skill_matches)) {
    foreach ($weak_skill_matches as $ws) {
        $learn_list[] = "Practice: {$ws} — short exercises, one mini-project and a tutorial.";
    }
} else {
    // fallback: lowest-weight skills
    $stmt = $conn->prepare("SELECT skill_name FROM skills WHERE career_path_id=? ORDER BY weight ASC LIMIT 4");
    $stmt->bind_param("i", $career_path_id);
    $stmt->execute();
    $r = $stmt->get_result();
    while ($row = $r->fetch_assoc()) $learn_list[] = "Improve: {$row['skill_name']}";
    $stmt->close();
}
if (empty($learn_list)) $learn_list = ["Practice coding exercises", "Follow path tutorials", "Build a small project"];

// sanitize for JS
$js_skillLabels = json_encode($skillNames);
$js_skillData = json_encode($skillValues);

// radar config will use those variables

// -----------------------------
// Helper (escape)
function h($s){ return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); }
?>
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Result — <?= h($career['name']) ?> — AI Talent Engine</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<!-- Chart.js -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<!-- FONTS -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap" rel="stylesheet">

<style>
:root{
  --bg1:#001526;
  --bg2:#0b2740;
  --accent1:#00eaff; /* cyan */
  --accent2:#8a2be2; /* purple */
  --muted:#bfefff;
  --card: rgba(255,255,255,0.03);
}

/* ---------- Moving bold background (visible) ---------- */
html,body{height:100%;margin:0;font-family:Inter, Poppins, system-ui, sans-serif;color:#e8fbff;}
body {
  background: linear-gradient(120deg, #00142a 0%, #001a3a 35%, #08112a 100%);
  background-size: 300% 300%;
  animation: flowBG 18s ease-in-out infinite;
  -webkit-font-smoothing:antialiased;
  padding: 18px;
}
@keyframes flowBG {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* container */
.wrapper { max-width:1200px; margin: 12px auto; display: grid; grid-template-columns: 1fr 380px; gap:20px; align-items:start; }

/* header */
.header {
  display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:6px;
}
.brand { display:flex; gap:12px; align-items:center; }
.logo {
  width:58px; height:58px; border-radius:12px; background: linear-gradient(135deg,var(--accent1),var(--accent2));
  display:flex; align-items:center; justify-content:center; font-weight:900; color:#001; font-size:18px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.6);
}
.title-box { line-height:1; }
.title { color:var(--accent1); font-weight:800; font-size:18px; letter-spacing:0.2px; }
.subtitle { color:var(--muted); font-size:13px; margin-top:4px; }

/* common card */
.card {
  background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
  border-radius:14px; padding:18px; border: 1px solid rgba(255,255,255,0.04);
  box-shadow: 0 12px 40px rgba(1,12,20,0.6);
}

/* main left column */
.main { display:flex; flex-direction:column; gap:18px; }

/* neon score circle */
.score-wrap { display:flex; gap:18px; align-items:center; }
.score-ring {
  width:160px; height:160px; border-radius:50%; display:flex; align-items:center; justify-content:center;
  background: radial-gradient(circle at 30% 20%, rgba(255,255,255,0.02), rgba(0,0,0,0.2));
  border: 6px solid rgba(0,234,255,0.06);
  box-shadow: 0 12px 30px rgba(0,0,0,0.6), inset 0 0 30px rgba(138,43,226,0.03);
}
.score-inner { text-align:center; }
.score-num { font-size:26px; font-weight:800; color:var(--accent1); }
.score-percent { color:var(--muted); margin-top:4px; }

/* weak topic bubbles */
.bubbles { display:flex; flex-wrap:wrap; gap:10px; margin-top:8px; }
.bubble {
  padding:8px 12px; border-radius:999px; background: linear-gradient(90deg, rgba(255,255,255,0.03), rgba(255,255,255,0.02));
  border: 1px solid rgba(255,255,255,0.03); color:#ffd9ff; font-weight:700; font-size:13px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.45);
}

/* charts layout */
.visuals { display:grid; grid-template-columns: 1fr 1fr; gap:14px; margin-top:12px; }
canvas { width:100% !important; height:280px !important; background: linear-gradient(180deg, rgba(0,0,0,0.04), rgba(255,255,255,0.01)); border-radius:10px; padding:8px; }

/* recommended actions */
.actions { margin-top:12px; display:flex; flex-direction:column; gap:10px; }

/* right col */
.sidebar { display:flex; flex-direction:column; gap:18px; }
.small-title { color:var(--accent1); font-weight:800; margin-bottom:8px; }
.skill-row { display:flex; gap:12px; align-items:center; margin:8px 0; }
.skill-name { width:120px; color:#cfefff; font-weight:700; }
.skill-bar { flex:1; height:12px; background: rgba(255,255,255,0.03); border-radius:999px; overflow:hidden; }
.skill-fill { height:100%; border-radius:999px; transition: width 900ms cubic-bezier(.2,.9,.3,1); }

/* CTA */
.cta {
  margin-top:18px; display:flex; gap:12px; justify-content:space-between; align-items:center;
}
.btn {
  background: linear-gradient(90deg,var(--accent1),var(--accent2));
  color:#001; padding:10px 14px; border-radius:10px; font-weight:800; text-decoration:none;
  box-shadow: 0 10px 30px rgba(0,0,0,0.45);
}

/* responsive */
@media (max-width:980px) {
  .wrapper { display:block; padding:12px; }
  .sidebar { margin-top:12px; }
  canvas { height:240px !important; }
}
</style>
</head>
<body>

<div class="wrapper">
  <div class="header" style="grid-column:1/-1;">
    <div class="brand">
      <div class="logo">AI</div>
      <div class="title-box">
        <div class="title">AI Talent Engine — Result</div>
        <div class="subtitle"><?= h($career['name']) ?> · Score: <strong><?= h($score) ?>/<?= h($total) ?></strong> · <?= h($percent) ?>%</div>
      </div>
    </div>

    <div style="display:flex; gap:12px; align-items:center;">
      <a class="btn" href="student_dashboard.php">⬅ Back</a>
      <a class="btn" href="recommendations.php?path=<?= intval($career_path_id) ?>&score=<?= intval($score) ?>&total=<?= intval($total) ?>">🔥 AI Recommendations</a>
    </div>
  </div>

  <!-- LEFT MAIN -->
  <div class="main">

    <!-- Score Card -->
    <div class="card">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-weight:900; color:var(--accent1); font-size:16px;">Test Summary</div>
          <div style="color:var(--muted); margin-top:6px;">Completed: <?= h($created_at) ?></div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:12px; color:#cfefff; font-weight:800;">Career Path</div>
          <div style="font-weight:900; color:#f7fbff; font-size:14px;"><?= h($career['name']) ?></div>
        </div>
      </div>

      <div style="display:flex; gap:20px; align-items:center; margin-top:14px;">
        <div class="score-wrap">
          <div class="score-ring">
            <div class="score-inner">
              <div class="score-num"><?= h($score) ?> / <?= h($total) ?></div>
              <div class="score-percent"><?= h($percent) ?>%</div>
            </div>
          </div>
        </div>

        <div style="flex:1;">
          <div style="font-weight:800; color:var(--accent1);">Weak topics detected</div>
          <div class="bubbles" id="bubbles">
            <?php if (!empty($weak_topics)): ?>
              <?php foreach ($weak_topics as $w): ?>
                <div class="bubble"><?= h($w) ?></div>
              <?php endforeach; ?>
            <?php else: ?>
              <div class="bubble">None — great!</div>
            <?php endif; ?>
          </div>

          <div class="actions">
            <div style="font-weight:800; color:var(--accent1); margin-top:8px;">Recommended actions</div>
            <ul style="margin:0; padding-left:18px; color:#dffaff;">
              <?php foreach ($learn_list as $li): ?>
                <li><?= h($li) ?></li>
              <?php endforeach; ?>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Visual Insights -->
    <div class="card">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div class="small-title">Visual Insights</div>
          <div class="small" style="color:var(--muted)">Weak Skills radar & learning priority</div>
        </div>
      </div>

      <div class="visuals">
        <div>
          <canvas id="radarChart"></canvas>
        </div>
        <div>
          <canvas id="priorityChart"></canvas>
        </div>
      </div>

      <div style="margin-top:14px;">
        <div style="font-weight:800; color:var(--accent1); margin-bottom:8px;">30-Day Roadmap (Example)</div>
        <div style="display:flex; gap:10px; flex-wrap:wrap;">
          <div style="background:linear-gradient(90deg, rgba(255,255,255,0.02), rgba(0,0,0,0.02)); padding:10px; border-radius:10px; border:1px solid rgba(255,255,255,0.02); color:#dffaff;">Week 1: Revise fundamentals</div>
          <div style="background:linear-gradient(90deg, rgba(255,255,255,0.02), rgba(0,0,0,0.02)); padding:10px; border-radius:10px; border:1px solid rgba(255,255,255,0.02); color:#dffaff;">Week 2: Follow tutorial & mini project</div>
          <div style="background:linear-gradient(90deg, rgba(255,255,255,0.02), rgba(0,0,0,0.02)); padding:10px; border-radius:10px; border:1px solid rgba(255,255,255,0.02); color:#dffaff;">Week 3: Tests & debug</div>
          <div style="background:linear-gradient(90deg, rgba(255,255,255,0.02), rgba(0,0,0,0.02)); padding:10px; border-radius:10px; border:1px solid rgba(255,255,255,0.02); color:#dffaff;">Week 4: Polish & demo</div>
        </div>
      </div>
    </div>
    <!-- Projects & Tutorials -->
    <div class="card" style="text-align:center;">
        <div style="font-weight:900;color:var(--accent1);margin-bottom:10px;">
            <!-- Tutorials & Learning Material -->
        </div>

        <a href="tutorials.php?path=<?= $career_path_id ?>" class="btn" style="font-size:16px;">
            📘 View Tutorials
        </a>
    </div>

</div>  <!-- ✅ FIXED: Properly closes LEFT .main column -->


<!-- RIGHT SIDEBAR -->
<div class="sidebar">

    <div class="card">
        <div class="small-title">Quick Summary</div>
        <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
                <div style="color:#cfefff; font-weight:800;">Score</div>
                <div style="font-weight:900; font-size:18px;"><?= h($score) ?>/<?= h($total) ?> (<?= h($percent) ?>%)</div>
            </div>
            <div style="text-align:right;">
                <div style="color:var(--muted); font-size:13px;">Path</div>
                <div style="font-weight:800; color:#dffaff;"><?= h($career['name']) ?></div>
            </div>
        </div>

        <div style="margin-top:12px;">
            <div style="font-weight:800; color:var(--accent1); margin-bottom:8px;">Top Focus Areas</div>
            <?php
              $pairs = array_combine($skillNames, $skillValues);
              arsort($pairs);
              $top = array_slice($pairs, 0, 5, true);
            ?>
            <?php foreach ($top as $sk => $val): ?>
              <div class="skill-row">
                <div class="skill-name"><?= h($sk) ?></div>
                <div class="skill-bar">
                    <div class="skill-fill" style="width:<?= intval($val) ?>%; background:linear-gradient(90deg,var(--accent1),var(--accent2));"></div>
                </div>
              </div>
            <?php endforeach; ?>
        </div>
    </div>

    <div class="card">
        <div class="small-title">Fast Tips</div>
        <ul style="color:#dffaff; margin-top:8px;">
            <li>Practice 30-min daily on a single weak skill.</li>
            <li>Ship small projects & document them.</li>
            <li>Re-take test after 2 weeks to measure improvement.</li>
        </ul>
    </div>

</div> <!-- END SIDEBAR -->


</div>

<!-- Charts -->
<script>
const skillLabels = <?= $js_skillLabels ?>;
const skillData = <?= $js_skillData ?>;

// Radar Chart
new Chart(document.getElementById('radarChart'), {
  type: 'radar',
  data: {
    labels: skillLabels,
    datasets: [{
      label: 'Skill Strength',
      data: skillData,
      fill: true,
      backgroundColor: 'rgba(138,43,226,0.12)',
      borderColor: '#8a2be2',
      borderWidth: 2,
      pointBackgroundColor: '#00eaff'
    }]
  },
  options: {
    responsive: true,
    scales: {
      r: {
        ticks: { color:'#bfefff', beginAtZero:true, max:100 },
        pointLabels: { color:'#e6f7ff' }
      }
    },
    plugins: { legend: { display: false } },
    animation: { duration: 900, easing: 'easeOutQuart' }
  }
});

// Priority Bar (descending)
(function(){
  const labels = skillLabels.slice().reverse();
  const values = skillData.slice().reverse();
  new Chart(document.getElementById('priorityChart'), {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Priority',
        data: values,
        backgroundColor: labels.map((_,i) => i % 2 ? 'rgba(138,43,226,0.92)' : 'rgba(0,234,255,0.92)'),
        borderRadius: 8,
        barThickness: 18
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      plugins: { legend: { display:false } },
      scales: {
        x: { ticks: { color:'#bfefff' }, beginAtZero:true, max:100, grid: { color: 'rgba(255,255,255,0.03)'} },
        y: { ticks: { color:'#e6f7ff' } }
      },
      animation: { duration: 900, easing: 'easeOutQuart' }
    }
  });
})();

// Animate bubbles (gentle scale)
document.querySelectorAll('.bubble').forEach((b,i)=>{
  b.style.transform = 'scale(0.95)';
  b.style.opacity = '0.9';
  setTimeout(()=>{ b.style.transition = 'transform 600ms cubic-bezier(.2,.9,.3,1), opacity 400ms'; b.style.transform='scale(1)'; b.style.opacity='1'; }, i*90);
});

// Animate skill bars (delayed)
document.querySelectorAll('.skill-fill').forEach((el, i) => {
  el.style.width = '0%';
  setTimeout(()=> { el.style.width = el.getAttribute('style').match(/width:([0-9]+)%/)? el.getAttribute('style').match(/width:([0-9]+)%/)[1] + '%' : '60%'; }, 140 + i*120);
});
</script>

</body>
</html>
