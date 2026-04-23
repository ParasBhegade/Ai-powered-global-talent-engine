<?php
session_start();
require "config.php";

if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit;
}

$session_id = $_GET['session_id'] ?? '';
$user_id = $_SESSION['user_id'];

if (!$session_id) {
    die("Invalid session ID");
}

// Load only this session
$stmt = $conn->prepare("
    SELECT * FROM ai_interview_results
    WHERE user_id = ? AND session_id = ?
    ORDER BY id ASC
");
$stmt->bind_param("is", $user_id, $session_id);
$stmt->execute();
$res = $stmt->get_result();

$rows = [];
while ($r = $res->fetch_assoc()) {
    $rows[] = $r;
}

// compute session score
$sum = 0;
$count = count($rows);
foreach ($rows as $r) {
    $sum += (int)$r['ai_score'];
}
$avg = $count ? round($sum / $count, 1) : 0;
$percent = round(($avg / 10) * 360);

$level = ($avg >= 8) ? "Advanced" : (($avg >= 5) ? "Intermediate" : "Beginner");
?>

<!DOCTYPE html>
<html>
<head>
<title>Interview Result</title>
<meta charset="utf-8">

<style>

/* ===== Circular Score ===== */
.score-wrapper {
    text-align: center;
    padding: 20px 0;
}

.score-circle {
    width: 180px;
    height: 180px;
    margin: auto;
    border-radius: 50%;
    background: conic-gradient( #00eaff var(--value),     /* cyan progress */
        #3a3a7eff 0deg );
    display: flex;
    justify-content: center;
    align-items: center;
    transition: .4s ease;
}

.score-inner {
    width: 130px;
    height: 130px;
    background: #0b0f24;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 28px;
    font-weight: 700;
    color: #d7e9ff;
    box-shadow: inset 0 0 25px rgba(0,0,0,0.5);
}

.score-text {
    margin-top: 12px;
    color: #d7e9ff;
    font-size: 18px;
    font-weight: 600;
}

/* ===== UI Theme ===== */
body {
    margin:0;
    font-family:Poppins, sans-serif;
    background:linear-gradient(135deg,#000014,#0a0033,#001a40,#2a0080);
    background-size:300% 300%;
    animation:move 12s infinite alternate;
    color:#fff;
}

@keyframes move {
    0% {background-position:0% 50%;}
    100% {background-position:100% 50%;}
}

.container {
    max-width:900px; 
    margin:40px auto; 
    padding:20px;
}

.glass {
    background:rgba(255,255,255,0.06);
    border-radius:14px;
    padding:18px;
    border:1px solid rgba(255,255,255,0.1);
    margin-bottom:18px;
    backdrop-filter:blur(10px);
}

.badge {
    padding:8px 15px;
    background:linear-gradient(45deg,#00eaff,#7b00ff);
    border-radius:12px;
    font-weight:700;
}

.qbox {
    background:rgba(255,255,255,0.05);
    padding:14px;
    border-radius:10px;
}
</style>

</head>
<body>

<div class="container">

    <div class="glass">
        <h2>📊 Interview Summary</h2>
        <p>Session ID: <b><?= $session_id; ?></b></p>
        <div class="badge"><?= $level; ?></div>

        <!-- 🔵 Circular Score Block -->
        <div class="score-wrapper">
            <div class="score-circle" style="--value: 0deg;" id="scoreCircle">
                <div class="score-inner">
                    <?= $avg ?>/10
                </div>
            </div>

            <div class="score-text">
                Overall Score: <?= $avg ?>/10 (<?= round(($avg/10)*100) ?>%)
            </div>
        </div>
    </div>

    <div class="glass">
        <h3>📝 Detailed Evaluation</h3>

        <?php foreach ($rows as $r): ?>
        <div class="qbox" style="margin-bottom:14px">
            <b>Q:</b> <?= htmlspecialchars($r['question']); ?><br><br>

            <b>Your Answer:</b><br>
            <?= nl2br(htmlspecialchars($r['user_answer'])); ?><br><br>

            <b>AI Feedback:</b><br>
            <?= nl2br(htmlspecialchars($r['ai_feedback'])); ?><br><br>

            <b>Score:</b> 
            <span style="color:#00eaff;font-weight:700"><?= $r['ai_score']; ?>/10</span>
        </div>
        <?php endforeach; ?>
    </div>

    <div class="glass">
        <h3>📈 Tips to Improve</h3>
        <ul>
            <li>Follow the AI feedback for each question.</li>
            <li>Give structured answers (Intro → Explanation → Example → Result).</li>
            <li>Practice again for better accuracy.</li>
        </ul>
    </div>

    <center>
        <a href="interview_select.php" class="badge">Start New Interview</a>
    </center>
    <center style="margin-top:20px;">
        <a href="student_dashboard.php" class="badge" style="text-decoration:none;">
            🔙 Back to Dashboard
        </a>
    </center>

</div>

<script>
// Animate the circular meter
document.addEventListener("DOMContentLoaded", () => {
    const circle = document.getElementById("scoreCircle");
    let finalValue = <?= $percent ?>; // degrees
    let current = 0;

    let anim = setInterval(() => {
        current += 4;
        if (current >= finalValue) current = finalValue;
        circle.style.setProperty("--value", current + "deg");

        if (current >= finalValue) clearInterval(anim);
    }, 10);
});
</script>

</body>
</html>
