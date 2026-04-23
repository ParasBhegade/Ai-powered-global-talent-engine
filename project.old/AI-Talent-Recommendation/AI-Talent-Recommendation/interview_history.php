<?php
// interview_history.php
session_start();
require "config.php";
if (!isset($_SESSION['user_id'])) { header("Location: login.php"); exit; }
$user_id = $_SESSION['user_id'];

$stmt = $conn->prepare("SELECT * FROM ai_interview_results WHERE user_id=? ORDER BY created_at DESC LIMIT 100");
$stmt->bind_param("i",$user_id); $stmt->execute(); $res=$stmt->get_result();
$rows = []; while($r=$res->fetch_assoc()) $rows[]=$r;
?>
<!DOCTYPE html>
<html><head>
<meta charset="utf-8"><title>Interview History</title>
<style>
body{font-family:Poppins, sans-serif;background:linear-gradient(135deg,#0d0d1a,#1c004d,#002650,#330066);color:#fff;margin:0;padding:20px}
.container{max-width:1100px;margin:0 auto}
.item{background:rgba(255,255,255,0.04);padding:14px;border-radius:10px;margin-bottom:10px;display:flex;justify-content:space-between}
.left{max-width:85%}
.small{font-size:13px;color:#cfe6ff}
.badge{background:linear-gradient(135deg,#5f00ff,#009dff);padding:8px 12px;border-radius:10px}
</style>
</head><body>
<div class="container">
  <h2>📚 Interview History</h2>
  <?php if(empty($rows)) echo "<div>No history yet.</div>"; ?>
  <?php foreach($rows as $r): ?>
    <div class="item">
      <div class="left">
        <div><b><?php echo htmlspecialchars($r['job_role']); ?></b> — <span class="small"><?php echo $r['difficulty']; ?></span></div>
        <div class="small"><?php echo nl2br(htmlspecialchars($r['question'])); ?></div>
        <div class="small" style="margin-top:6px">Score: <?php echo $r['ai_score']; ?>/10 • <?php echo $r['created_at']; ?></div>
      </div>
      <div style="text-align:right">
        <div class="badge">View</div>
      </div>
    </div>
  <?php endforeach; ?>
  <div style="margin-top:18px"><a href="interview_select.php" style="color:#fff;text-decoration:none">← Back to selection</a></div>
</div>
</body></html>
