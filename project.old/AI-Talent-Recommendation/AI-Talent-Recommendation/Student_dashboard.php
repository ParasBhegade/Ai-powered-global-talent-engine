<?php
session_start();
require 'config.php';

// Redirect if not logged in
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit();
}

$user_id = (int)$_SESSION['user_id'];

// Fetch user data
$stmt = $conn->prepare("SELECT id, name, email, selected_path FROM users WHERE id=?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();
$stmt->close();

$name = $user['name'] ?? 'Student';
$email = $user['email'] ?? '';
$selected_path_id = (int)($user['selected_path'] ?? 0);

// Fetch career path details
$career = null;
if ($selected_path_id) {
    $stmt = $conn->prepare("SELECT name, description FROM career_paths WHERE id=? LIMIT 1");
    $stmt->bind_param("i", $selected_path_id);
    $stmt->execute();
    $career = $stmt->get_result()->fetch_assoc();
    $stmt->close();
}

// Fetch skills dynamically
$skillNames = [];
$skillValues = [];

if ($selected_path_id) {
    $stmt = $conn->prepare("SELECT skill_name, weight FROM skills WHERE career_path_id=? ORDER BY weight DESC");
    $stmt->bind_param("i", $selected_path_id);
    $stmt->execute();
    $result = $stmt->get_result();

    while ($row = $result->fetch_assoc()) {
        $skillNames[] = $row['skill_name'];
        $skillValues[] = (float)$row['weight'];
    }
    $stmt->close();
}

// Fallback if no skills exist
if (empty($skillNames)) {
    $skillNames = ["HTML", "CSS", "JavaScript", "React"];
    $skillValues = [70, 60, 80, 50];
}

// Fetch latest test score
$latestScore = null;
$weak = "—";
$stmt = $conn->prepare("SELECT score, total, weak_topics FROM user_scores WHERE user_id=? AND career_path_id=? ORDER BY created_at DESC LIMIT 1");
$stmt->bind_param("ii", $user_id, $selected_path_id);
$stmt->execute();
$latestScore = $stmt->get_result()->fetch_assoc();
$stmt->close();

if ($latestScore && !empty($latestScore['weak_topics'])) {
    $weak = $latestScore['weak_topics'];
}

// Random readiness (you can link with test logic later)
$readiness = rand(60, 95);
?>
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Student Dashboard | AI Talent Engine</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet">
<style>
  :root{
    --bg0:#060617;
    --bg1:#07091f;
    --card:#0f1720;
    --glass: rgba(255,255,255,0.035);
    --accent1:#00eaff;
    --accent2:#7b39ff;
    --muted:#9fbfdc;
  }
  /* Moving gradient background */
  html,body{height:100%;margin:0;font-family:'Poppins',sans-serif;background:linear-gradient(120deg,#05031a,#06082b 25%,#001b3a 60%,#140032);background-size:300% 300%;animation:moveBG 14s linear infinite;color:#d6f3ff}
  @keyframes moveBG{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}

  /* Page container */
  .wrap{max-width:1250px;margin:28px auto;padding:22px;box-sizing:border-box}

  /* Top header */
  .topbar{display:flex;justify-content:space-between;align-items:center;padding:18px 22px;border-radius:14px;background:linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));box-shadow:0 8px 30px rgba(8,10,20,0.6);border:1px solid rgba(255,255,255,0.03)}
  .brand{display:flex;gap:12px;align-items:center}
  .logo { width:44px;height:44px;border-radius:10px;background:linear-gradient(135deg,var(--accent1),var(--accent2));display:flex;align-items:center;justify-content:center;color:#001;font-weight:800;font-size:20px;box-shadow:0 6px 18px rgba(123,57,255,0.12)}
  .title{font-weight:700;font-size:20px;color:#c8fbff}
  .top-actions{display:flex;align-items:center;gap:14px}
  .readiness{color:var(--accent1);font-weight:700}
  .btn-logout{padding:8px 14px;border-radius:10px;background:linear-gradient(90deg,var(--accent1),var(--accent2));color:#001;text-decoration:none;font-weight:700;box-shadow:0 6px 18px rgba(0,0,0,0.25)}

  /* Layout */
  .layout{display:grid;grid-template-columns:300px 1fr;gap:22px;margin-top:18px}
  @media(max-width:980px){ .layout{grid-template-columns:1fr; } .leftCol{order:2} .rightCol{order:1} }

  /* Left column (sidebar) */
  .leftCard{background:linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));border-radius:12px;padding:18px;border:1px solid rgba(255,255,255,0.03);box-shadow:0 8px 24px rgba(2,6,20,0.6)}
  .profileName{font-weight:700;color:var(--accent1);font-size:18px;margin-bottom:2px}
  .profileEmail{color:var(--muted);font-size:13px;margin-bottom:12px}
  .sidebarBtns{display:flex;flex-direction:column;gap:10px;margin-top:10px}
  .sidebarBtns a{display:inline-block;padding:10px 14px;border-radius:10px;background:linear-gradient(90deg,#071b28,#0b1130);color:#cfefff;text-decoration:none;font-weight:700;border:1px solid rgba(255,255,255,0.03);box-shadow:0 6px 18px rgba(0,0,0,0.45)}
  .sidebarNote{margin-top:14px;color:#a9cfe6;font-size:13px;line-height:1.45}

  /* Right column content */
  .rightCol .card{background:linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));border-radius:12px;padding:18px;border:1px solid rgba(255,255,255,0.03);box-shadow:0 12px 26px rgba(2,6,20,0.6);margin-bottom:18px}
  .sectionTitle{display:flex;align-items:center;gap:10px;font-weight:700;color:var(--accent1);margin-bottom:10px}
  .sectionTitle small{color:var(--muted);font-weight:500;margin-left:6px}

  /* career card layout */
  .careerHead{display:flex;justify-content:space-between;align-items:center}
  .careerName{font-size:20px;font-weight:800;color:#eafcff}
  .careerDesc{color:#cfefff;margin-top:8px;font-size:14px}

  /* Chart area */
  .chartWrap{display:flex;gap:18px;align-items:flex-start}
  .chartBox{flex:1;min-height:320px;display:flex;align-items:center;justify-content:center;padding:8px}

  /* result card */
  .resultBig{display:flex;align-items:center;gap:20px}
  .scoreBubble{width:120px;height:120px;border-radius:12px;background:linear-gradient(180deg,var(--accent1),var(--accent2));display:flex;align-items:center;justify-content:center;color:#001;font-weight:800;font-size:28px;box-shadow:0 10px 30px rgba(123,57,255,0.12)}
  .weakList{color:#d6f3ff}

  /* small helpers */
  .muted{color:var(--muted)}
  .small{font-size:13px;color:#bcd6ea}

  /* footer / credits */
  .footer{margin-top:6px;color:#9fbfdc;font-size:13px;text-align:center;padding:12px}
</style>
</head>
<body>
  <div class="wrap">
    <!-- TOPBAR -->
    <div class="topbar" role="banner">
      <div class="brand">
        <div class="logo">AI</div>
        <div>
          <div class="title">AI Powered Global Talent</div>
          <div class="small muted">Student Dashboard</div>
        </div>
      </div>

      <div class="top-actions">
        <div class="readiness">Readiness: <span style="font-weight:900;color:#dffeff"><?= htmlspecialchars($readiness) ?>%</span></div>
        <a class="btn-logout" href="logout.php">Logout</a>
        <a class="btn" href="index.php">🏠 Home</a><br>

      </div>
    </div>

    <!-- LAYOUT -->
    <div class="layout">
      <!-- LEFT -->
      <aside class="leftCol leftCard" aria-label="sidebar">
        <div>
          <div class="profileName"><?= htmlspecialchars($name) ?></div>
          <div class="profileEmail"><?= htmlspecialchars($email) ?></div>

          <div class="sidebarBtns">
            <a href="profile.php">View Profile</a>
            <a href="career_paths.php">Choose Path</a>
            <a href="test.php">Start Test</a>
            <a href="recommendations.php">Recommendations</a>
            <a href="tutorials.php">Tutorials</a>
            <a href="interview_select.php">AI Interview</a>
          </div>

          <div class="sidebarNote">
            <strong>Tip:</strong> Complete profile and practice the AI interview to increase readiness. Your personalized suggestions and tutorials will improve automatically.
          </div>
        </div>
      </aside>

      <!-- RIGHT -->
      <main class="rightCol">
        <!-- Career / header -->
        <div class="card">
          <div class="careerHead">
            <div>
              <div class="sectionTitle">🎓 Selected Career <small>— your focus</small></div>
              <?php if ($career): ?>
                <div class="careerName"><?= htmlspecialchars($career['name']) ?></div>
                <div class="careerDesc"><?= htmlspecialchars($career['description']) ?></div>
              <?php else: ?>
                <div class="careerName muted">No career selected</div>
                <div class="small">Choose a career path to receive tailored recommendations and interview questions.</div>
                <div style="margin-top:12px"><a class="sidebarBtns" style="display:inline-block;padding:8px 12px" href="career_paths.php">Select Career Path</a></div>
              <?php endif; ?>
            </div>

            <div style="text-align:right">
              <div class="small muted">User ID</div>
              <div style="font-weight:800;color:#dffeff"><?= htmlspecialchars($user_id) ?></div>
            </div>
          </div>
        </div>

        <!-- Skill progress + Chart -->
        <div class="card">
          <div class="sectionTitle">📊 Skill Progress <small>— based on selected career</small></div>
          <div class="chartWrap">
            <div class="chartBox" style="flex:0 0 520px;">
              <canvas id="skillChart" height="320"></canvas>
            </div>

            <div style="flex:1;min-width:220px;">
              <div style="margin-bottom:14px">
                <div class="small muted">Top skills</div>
                <div style="font-weight:700;color:#eafcff;margin-top:6px">
                  <?php
                    // show top 3 skills
                    $top = array_slice($skillNames,0,3);
                    if (count($top)) {
                      echo htmlspecialchars(implode(' • ', $top));
                    } else {
                      echo "—";
                    }
                  ?>
                </div>
              </div>

              <div style="margin-bottom:14px">
                <div class="small muted">Latest test</div>
                <?php if ($latestScore): ?>
                  <div style="font-size:20px;font-weight:800;color:var(--accent1)"><?= htmlspecialchars($latestScore['score']) ?>/<?= htmlspecialchars($latestScore['total']) ?></div>
                  <div class="small muted">Weak topics: <span class="weakList"><?= htmlspecialchars($weak) ?></span></div>
                <?php else: ?>
                  <div class="small muted">No test taken yet. Try the mock test to see your score.</div>
                <?php endif; ?>
              </div>

             <!-- <div style="margin-top:8px">
                <a href="test.php" class="sidebarBtns" style="display:inline-block;padding:10px 14px;background:linear-gradient(90deg,var(--accent1),var(--accent2));color:#001">Take Mock Test</a>
                <div style="height:12px"></div>
                <a href="recommendations.php" class="sidebarBtns" style="display:inline-block;padding:10px 14px">See Recommendations</a>
              </div>
            </div>
          </div>
        </div>-->

        <!-- Latest activity / quick cards -->
        <div class="card" style="display:flex;gap:16px;align-items:stretch;flex-wrap:wrap">
          <div style="flex:0 0 260px;padding:14px;border-radius:10px;background:linear-gradient(180deg, rgba(255,255,255,0.01), rgba(255,255,255,0.00));">
            <div class="small muted">Readiness</div>
            <div style="font-weight:900;font-size:28px;color:var(--accent1);margin-top:6px"><?= htmlspecialchars($readiness) ?>%</div>
            <div class="small muted" style="margin-top:8px">Keep practicing and completing tutorials to improve.</div>
          </div>

          <div style="flex:1;padding:14px;border-radius:10px;background:linear-gradient(180deg, rgba(255,255,255,0.01), rgba(255,255,255,0.00));">
            <div class="small muted">Recent Activity</div>
            <ul style="margin:8px 0 0 18px;color:#bfe8ff">
              <li>Profile updated • <?= date('M d, Y') ?></li>
              <li>Viewed tutorials • <?= date('M d, Y', strtotime('-3 days')) ?></li>
              <li>Took mock test • <?= date('M d, Y', strtotime('-7 days')) ?></li>
            </ul>
          </div>
        </div>
      </main>
    </div>

    <div class="footer">© <?= date('Y') ?> AI Talent Engine • — stylish, responsive, and fast.</div>
  </div>

<script>
  // Chart.js — bar chart with neat colors
  const skillNames = <?= json_encode(array_values($skillNames)) ?>;
  const skillValues = <?= json_encode(array_values($skillValues)) ?>;

  const ctx = document.getElementById('skillChart').getContext('2d');
  const gradientA = ctx.createLinearGradient(0,0,0,400);
  gradientA.addColorStop(0, '#00eaff');
  gradientA.addColorStop(1, '#00a6ff');

  const gradientB = ctx.createLinearGradient(0,0,0,400);
  gradientB.addColorStop(0, '#7b39ff');
  gradientB.addColorStop(1, '#5b00d8');

  // alternate colors
  const backgroundColors = [];
  for (let i=0;i<skillValues.length;i++){
    backgroundColors.push(i%2===0 ? gradientA : gradientB);
  }

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: skillNames,
      datasets: [{
        label: 'Skill Weight',
        data: skillValues,
        backgroundColor: backgroundColors,
        borderRadius: 8,
        barPercentage: 0.6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#d6f3ff' }, grid: { display: false } },
        y: { ticks: { color: '#d6f3ff' }, grid: { color: 'rgba(255,255,255,0.03)' } }
      }
    }
  });
</script>
</body>
</html>
