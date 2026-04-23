<?php
session_start();
require 'config.php';

// Only admin access
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    header("Location: admin_login.php");
    exit();
}

// Fetch all career paths
$careerPaths = $conn->query("SELECT * FROM career_paths ORDER BY id ASC");
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Admin Dashboard | AI Talent Engine</title>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">

<style>
/* ===== Global Theme ===== */
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
    width: 95%;
    margin: 30px auto;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(0,0,0,0.4);
    padding: 20px 30px;
    border-radius: 12px;
    box-shadow: 0 5px 15px rgba(0,255,255,0.2);
}
.header h2 {
    color: #00eaff;
    margin: 0;
}
.logout {
    padding: 10px 20px;
    background: linear-gradient(45deg,#00eaff,#8a2be2);
    border-radius: 10px;
    color: black;
    font-weight: bold;
    text-decoration: none;
    transition: 0.3s;
}
.logout:hover { transform: scale(1.05); }

/* ===== Card ===== */
.card {
    background: rgba(255,255,255,0.05);
    backdrop-filter: blur(8px);
    padding: 25px;
    border-radius: 15px;
    box-shadow: 0 0 25px rgba(0,255,255,0.08);
    margin-top: 25px;
}
.section-title {
    color: #00eaff;
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 20px;
}

/* ===== Buttons ===== */
.btn {
    display: inline-block;
    padding: 10px 18px;
    background: linear-gradient(45deg,#00eaff,#8a2be2);
    border: none;
    border-radius: 8px;
    color: #000;
    font-weight: 700;
    text-decoration: none;
    transition: 0.3s;
}
.btn:hover { transform: scale(1.05); }

/* ===== Table ===== */
table {
    width: 100%;
    border-collapse: collapse;
    color: #fff;
}
th, td {
    padding: 12px;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    text-align: left;
}
th { color: #00eaff; }
tr:hover { background-color: rgba(255,255,255,0.05); }

a.edit, a.delete {
    color: #00eaff;
    text-decoration: none;
    font-weight: bold;
    margin-right: 12px;
}
a.delete { color: #ff6b6b; }
a.delete:hover, a.edit:hover { text-decoration: underline; }

/* ===== Responsive ===== */
@media (max-width: 768px) {
    .header { flex-direction: column; align-items: flex-start; }
    table, th, td { font-size: 14px; }
}
</style>
</head>
<body>

<div class="container">
    <div class="header">
        <h2>🧠 Admin Dashboard</h2>
        <a href="logout.php" class="logout">Logout</a>
    </div>

    <div class="card">
        <h3 class="section-title">Manage Career Paths</h3>
        <a href="add_path.php" class="btn">+ Add New Path</a>
        <br><br>

        <table>
            <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Actions</th>
            </tr>

            <?php if ($careerPaths && $careerPaths->num_rows > 0): ?>
                <?php while ($row = $careerPaths->fetch_assoc()): ?>
                <tr>
                    <td><?= $row['id'] ?></td>
                    <td><?= htmlspecialchars($row['name']) ?></td>
                    <td><?= htmlspecialchars(substr($row['description'], 0, 70)) ?>...</td>
                    <td>
                        <a href="edit_path.php?id=<?= $row['id'] ?>" class="edit">Edit</a>
                        <a href="delete_path.php?id=<?= $row['id'] ?>" class="delete" onclick="return confirm('Delete this path?')">Delete</a>
                        <a href="manage_skills.php?path_id=<?= $row['id'] ?>" class="edit">Skills</a>

                    </td>
                </tr>
                <?php endwhile; ?>
            <?php else: ?>
                <tr>
                    <td colspan="4" style="text-align:center; color:#ccc;">No career paths found.</td>
                </tr>
            <?php endif; ?>
        </table>
    </div>

    <div class="card">
        <h3 class="section-title">System Overview</h3>
        <p>✅ Total Paths: <strong><?= $careerPaths->num_rows ?></strong></p>
        <p>✅ Admin Panel Active</p>
        <p>Use this dashboard to manage all career paths, skills, and user progress.</p>
    </div>
</div>

</body>
</html>

<li><a href="tutorials_admin.php">📚 Manage Tutorials</a></li>
