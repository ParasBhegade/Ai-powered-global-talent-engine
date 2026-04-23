<?php
session_start();
require 'config.php';

// Admin only
if (!isset($_SESSION['user_id']) || ($_SESSION['role'] ?? '') !== 'admin') {
    header('Location: admin_login.php');
    exit;
}

// Totals
$totUsers = $conn->query("SELECT COUNT(*) AS c FROM users")->fetch_assoc()['c'] ?? 0;
$totTests = $conn->query("SELECT COUNT(*) AS c FROM user_scores")->fetch_assoc()['c'] ?? 0;
$avgScoreOverall = $conn->query("SELECT AVG(score/NULLIF(total,0))*100 AS pct FROM user_scores")->fetch_assoc()['pct'];
$avgScoreOverall = $avgScoreOverall !== null ? round($avgScoreOverall,1) : 0;

// Avg score by career path
$pathLabels = [];
$pathAvg = [];
$pathUsers = [];
$paths = $conn->query("SELECT id, name FROM career_paths ORDER BY id");
while ($p = $paths->fetch_assoc()) {
    $pid = (int)$p['id'];
    $pathLabels[] = $p['name'];

    $stmt = $conn->prepare("SELECT AVG(score/NULLIF(total,0))*100 AS pct FROM user_scores WHERE career_path_id = ?");
    $stmt->bind_param("i",$pid);
    $stmt->execute();
    $r = $stmt->get_result()->fetch_assoc();
    $pct = $r['pct'] ?? 0;
    $pathAvg[] = round($pct,1);

    // users per path
    $stmt2 = $conn->prepare("SELECT COUNT(*) AS c FROM users WHERE selected_path = ?");
    $stmt2->bind_param("i",$pid);
    $stmt2->execute();
    $c = $stmt2->get_result()->fetch_assoc()['c'] ?? 0;
    $pathUsers[] = (int)$c;

    $stmt->close();
    $stmt2->close();
}

// Top weak topics across all tests (simple text aggregation)
$topWeak = [];
$res = $conn->query("SELECT weak_topics FROM user_scores WHERE weak_topics IS NOT NULL AND TRIM(weak_topics)<>''");
$counter = [];
while ($r = $res->fetch_assoc()) {
    $parts = array_filter(array_map('trim', explode(',', $r['weak_topics'])));
    foreach ($parts as $p) {
        $p = strtolower($p);
        if ($p === '') continue;
        if (!isset($counter[$p])) $counter[$p] = 0;
        $counter[$p]++;
    }
}
arsort($counter);
$topWeak = array_slice($counter, 0, 12, true);

// Latest tests table
$latestTests = $conn->query("SELECT us.id, u.name AS user_name, cp.name AS path_name, us.score, us.total, us.weak_topics, us.created_at
                             FROM user_scores us
                             LEFT JOIN users u ON u.id = us.user_id
                             LEFT JOIN career_paths cp ON cp.id = us.career_path_id
                             ORDER BY us.created_at DESC LIMIT 20");
?>
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Admin Analytics — AI Talent Engine</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<style>
body{margin:0; font-family:Inter, Poppins, sans-serif; background:linear-gradient(180deg,#031022,#021426); color:#e8fbff}
.header{padding:18px 28px; display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.15); border-bottom:1px solid rgba(255,255,255,0.03)}
.brand{color:#00eaff; font-weight:700}
.container{max-width:1200px; margin:20px auto; padding:0 18px}
.grid{display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:16px}
.stat{background:linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); padding:16px; border-radius:10px; text-align:center}
.stat h2{margin:6px 0; color:#00eaff}
.card{background:linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); padding:18px; border-radius:10px; margin-bottom:14px}
.row{display:flex;gap:12px}
.col{flex:1}
.table{width:100%; border-collapse:collapse}
.table th, .table td{padding:10px; border-bottom:1px solid rgba(255,255,255,0.03); text-align:left}
.small{color:#9fb6c6; font-size:13px}
.pill{background:rgba(0,234,255,0.08); color:#00eaff; padding:6px 10px; border-radius:999px; font-weight:700}
</style>
</head>
<body>
<div class="header">
    <div class="brand">Admin Analytics</div>
    <div>
        <a class="pill" href="admin_dashboard.php">Admin Panel</a>
        <a class="pill" href="logout.php" style="margin-left:8px">Logout</a>
    </div>
</div>

<div class="container">
    <div class="grid">
        <div class="stat card">
            <div class="small">Total Users</div>
            <h2><?= $totUsers ?></h2>
        </div>
        <div class="stat card">
            <div class="small">Total Tests</div>
            <h2><?= $totTests ?></h2>
        </div>
        <div class="stat card">
            <div class="small">Average Score (all)</div>
            <h2><?= $avgScoreOverall ?>%</h2>
        </div>
    </div>

    <div class="row">
        <div class="col card">
            <div class="small">Average Score by Career Path</div>
            <canvas id="avgChart" height="140"></canvas>
        </div>

        <div class="col card">
            <div class="small">Users per Path</div>
            <canvas id="usersChart" height="140"></canvas>
        </div>

        <div class="col card">
            <div class="small">Top Weak Topics</div>
            <ul class="small">
                <?php foreach ($topWeak as $topic=>$count): ?>
                    <li><?= htmlspecialchars(ucfirst($topic)) ?> — <?= $count ?> times</li>
                <?php endforeach; ?>
                <?php if (empty($topWeak)) echo "<li>No weak-topic data yet.</li>"; ?>
            </ul>
        </div>
    </div>

    <div class="card">
        <div class="small">Latest Tests</div>
        <table class="table">
            <thead><tr><th>#</th><th>User</th><th>Path</th><th>Score</th><th>Weak</th><th>When</th></tr></thead>
            <tbody>
                <?php while ($row = $latestTests->fetch_assoc()): ?>
                    <tr>
                        <td><?= $row['id'] ?></td>
                        <td><?= htmlspecialchars($row['user_name']) ?></td>
                        <td><?= htmlspecialchars($row['path_name']) ?></td>
                        <td><?= $row['score'] ?>/<?= $row['total'] ?> (<?= $row['total']>0 ? round($row['score']/$row['total']*100,1) : 0 ?>%)</td>
                        <td><?= htmlspecialchars($row['weak_topics']) ?></td>
                        <td class="small"><?= $row['created_at'] ?></td>
                    </tr>
                <?php endwhile; ?>
            </tbody>
        </table>
    </div>
</div>

<script>
const pathLabels = <?= json_encode($pathLabels) ?>;
const pathAvg = <?= json_encode($pathAvg) ?>;
const pathUsers = <?= json_encode($pathUsers) ?>;

new Chart(document.getElementById('avgChart'), {
    type:'bar',
    data:{labels:pathLabels, datasets:[{label:'Avg %', data:pathAvg, backgroundColor:'rgba(0,234,255,0.12)', borderColor:'#00eaff', borderWidth:1}]},
    options:{indexAxis:'y', scales:{x:{beginAtZero:true, max:100}}}
});

new Chart(document.getElementById('usersChart'), {
    type:'pie',
    data:{labels:pathLabels, datasets:[{data:pathUsers, backgroundColor: pathLabels.map((_,i)=>`hsl(${i*30%360} 70% 50% / .7)`)}]},
    options:{plugins:{legend:{position:'bottom'}}}
});
</script>
</body>
</html>
