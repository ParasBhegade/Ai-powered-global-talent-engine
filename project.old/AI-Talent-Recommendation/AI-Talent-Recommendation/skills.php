<?php
session_start();
require 'config.php';

// Make sure user is logged in
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit();
}

$user_id = (int)$_SESSION['user_id'];

// ✅ GET selected career path
$stmt = $conn->prepare("SELECT selected_path FROM users WHERE id=? LIMIT 1");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$res = $stmt->get_result()->fetch_assoc();
$stmt->close();

$career_path_id = (int)$res['selected_path'];

// If no path selected → redirect user
if ($career_path_id === 0) {
    header("Location: career_paths.php");
    exit();
}

// ✅ Get career path info
$stmt = $conn->prepare("SELECT name, description FROM career_paths WHERE id=?");
$stmt->bind_param("i", $career_path_id);
$stmt->execute();
$career = $stmt->get_result()->fetch_assoc();
$stmt->close();

// ✅ Get skills for this career path
$stmt = $conn->prepare("
    SELECT skill_name, category, weight 
    FROM skills 
    WHERE career_path_id=? 
    ORDER BY weight DESC, skill_name
");
$stmt->bind_param("i", $career_path_id);
$stmt->execute();
$skills = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();

?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Required Skills – AI Talent Engine</title>

<style>
body {
    margin:0;
    font-family:Poppins, Inter;
    background:#0a0f1f;
    color:white;
}

.container {
    padding:40px;
    text-align:center;
}

h1 {
    font-size:32px;
    color:#00eaff;
    text-shadow:0 0 10px #00eaff;
}

.desc {
    margin-top:10px;
    font-size:17px;
    color:#b1ecff;
}

.skills-grid {
    margin:40px auto;
    max-width:900px;
    display:grid;
    grid-template-columns:repeat(auto-fit,minmax(250px,1fr));
    gap:20px;
}

.skill-card {
    padding:20px;
    border-radius:14px;
    background:rgba(255,255,255,0.05);
    border:1px solid rgba(0,255,255,0.2);
    box-shadow:0 0 20px rgba(0,255,255,0.1);
    transition:0.3s;
}

.skill-card:hover {
    transform:translateY(-5px);
    box-shadow:0 0 25px rgba(0,255,255,0.3);
}

.skill-title {
    font-size:20px;
    font-weight:700;
    color:#00eaff;
}

.category {
    color:#ffd27f;
    font-size:14px;
    margin-top:5px;
}

.weight {
    margin-top:10px;
    font-size:14px;
    color:#baffd9;
}

.start-btn {
    padding:15px 25px;
    margin-top:20px;
    border:none;
    background:linear-gradient(90deg,#00eaff,#7d2cff);
    color:#00131a;
    font-weight:700;
    font-size:18px;
    border-radius:10px;
    cursor:pointer;
    box-shadow:0 0 20px rgba(0,238,255,0.3);
}

.start-btn:hover {
    transform:scale(1.05);
    box-shadow:0 0 30px rgba(125,44,255,0.4);
}

a.back {
    display:block;
    margin-top:20px;
    color:#8ee1ff;
    text-decoration:none;
}
</style>

</head>
<body>

<div class="container">

    <h1>Required Skills for: <?php echo htmlspecialchars($career['name']); ?></h1>
    <p class="desc">These are essential skills to become a strong <?php echo htmlspecialchars($career['name']); ?>.</p>

    <!-- ✅ Only ONE start test button now -->
    <a href="test.php">
        <button class="start-btn">Start Aptitude Test</button>
    </a>

    <div class="skills-grid">
        <?php if (empty($skills)): ?>
            <p style="grid-column:1 / -1; color:#ffbebe;">No skills found. Add skills in database.</p>
        <?php else: ?>
            <?php foreach ($skills as $s): ?>
            <div class="skill-card">
                <div class="skill-title"><?php echo htmlspecialchars($s['skill_name']); ?></div>
                <div class="category">Category: <?php echo htmlspecialchars($s['category']); ?></div>
                <div class="weight">Importance: <?php echo (int)$s['weight']; ?></div>
            </div>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>

    <a href="career_paths.php" class="back">← Choose another path</a>

</div>

</body>
</html>
