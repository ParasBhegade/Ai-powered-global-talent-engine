<?php
session_start();
require 'config.php';

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    header("Location: admin_login.php");
    exit();
}

if (!isset($_GET['path_id'])) {
    header("Location: admin_dashboard.php");
    exit();
}

$path_id = (int)$_GET['path_id'];
$path = $conn->query("SELECT * FROM career_paths WHERE id=$path_id")->fetch_assoc();
$skills = $conn->query("SELECT * FROM skills WHERE career_path_id=$path_id ORDER BY id ASC");
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Manage Skills | <?= htmlspecialchars($path['name']) ?></title>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">
<style>
body {
    margin: 0;
    background: linear-gradient(-45deg, #1e1e2f, #111, #002244, #003366);
    background-size: 400% 400%;
    animation: gradient 12s ease infinite;
    font-family: 'Poppins', sans-serif;
    color: #d7e9ff;
}
@keyframes gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}
.container {
    width: 90%;
    margin: 40px auto;
}
h2 {
    color: #00eaff;
}
.btn {
    display: inline-block;
    padding: 10px 18px;
    background: linear-gradient(45deg,#00eaff,#8a2be2);
    color: #000;
    font-weight: 700;
    border-radius: 8px;
    text-decoration: none;
    transition: 0.3s;
}
.btn:hover { transform: scale(1.05); }
table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
}
th, td {
    padding: 12px;
    border-bottom: 1px solid rgba(255,255,255,0.1);
}
th { color: #00eaff; text-align:left; }
a.edit, a.delete { text-decoration:none; margin-right:10px; }
a.edit { color: #00eaff; }
a.delete { color: #ff6b6b; }
</style>
</head>
<body>
<div class="container">
    <h2>⚙️ Manage Skills for: <?= htmlspecialchars($path['name']) ?></h2>
    <a href="add_skill.php?path_id=<?= $path_id ?>" class="btn">+ Add Skill</a>
    <a href="admin_dashboard.php" class="btn">⬅ Back to Dashboard</a>

    <table>
        <tr>
            <th>ID</th>
            <th>Skill Name</th>
            <th>Category</th>
            <th>Weight</th>
            <th>Actions</th>
        </tr>
        <?php if ($skills->num_rows > 0): ?>
            <?php while($row = $skills->fetch_assoc()): ?>
            <tr>
                <td><?= $row['id'] ?></td>
                <td><?= htmlspecialchars($row['skill_name']) ?></td>
                <td><?= htmlspecialchars($row['category']) ?></td>
                <td><?= $row['weight'] ?></td>
                <td>
                    <a href="edit_skill.php?id=<?= $row['id'] ?>&path_id=<?= $path_id ?>" class="edit">Edit</a>
                    <a href="delete_skill.php?id=<?= $row['id'] ?>&path_id=<?= $path_id ?>" class="delete" onclick="return confirm('Delete this skill?')">Delete</a>
                </td>
            </tr>
            <?php endwhile; ?>
        <?php else: ?>
            <tr><td colspan="5" style="text-align:center;color:#aaa;">No skills found for this path.</td></tr>
        <?php endif; ?>
    </table>
</div>
</body>
</html>
