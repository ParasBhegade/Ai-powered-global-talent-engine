<?php
session_start();
require "../config.php";

// Admin login check
if (!isset($_SESSION['admin_id'])) {
    header("Location: admin_login.php");
    exit;
}

// Fetch all tutorials with path names
$query = "SELECT t.*, c.name AS path_name 
          FROM tutorials t 
          LEFT JOIN career_paths c 
          ON t.career_path_id = c.id
          ORDER BY t.id DESC";
$result = mysqli_query($conn, $query);
?>
<!DOCTYPE html>
<html>
<head>
<title>Manage Tutorials</title>
<style>
body {
    margin:0;
    font-family: Poppins;
    color: white;
    background: linear-gradient(-45deg,#14002b,#003366,#001122,#330066);
    background-size: 400% 400%;
    animation: moveBG 13s infinite;
}
@keyframes moveBG {
    0% {background-position: 0 50%;}
    50% {background-position: 100% 50%;}
    100% {background-position: 0 50%;}
}

.container{
    width: 90%;
    margin: auto;
    margin-top: 40px;
}

h1 {
    text-align:center;
    color:#00eaff;
    text-shadow:0 0 12px #00eaff;
}

.table {
    width:100%;
    border-collapse: collapse;
    margin-top:30px;
}

.table th {
    background:#00eaff33;
    padding:12px;
}

.table td {
    padding:12px;
    border-bottom:1px solid #00eaff22;
}

.btn {
    padding:8px 15px;
    border-radius:8px;
    background:#00eaff;
    color:black;
    font-weight:bold;
    text-decoration:none;
}

.btn:hover {
    background:#7d2cff;
    color:white;
}

.add-btn {
    background:#7d2cff;
    color:white;
    padding:10px 20px;
    margin-bottom:20px;
    display:inline-block;
    border-radius:8px;
}
</style>
</head>
<body>

<div class="container">
    <h1>📚 Manage Tutorials</h1>

    <a href="add_tutorial.php" class="add-btn">+ Add New Tutorial</a>

    <table class="table">
        <tr>
            <th>ID</th>
            <th>Career Path</th>
            <th>Title</th>
            <th>URL</th>
            <th>Actions</th>
        </tr>

        <?php while($t = mysqli_fetch_assoc($result)) { ?>
        <tr>
            <td><?= $t['id'] ?></td>
            <td><?= $t['path_name'] ?></td>
            <td><?= htmlspecialchars($t['title']) ?></td>
            <td><a href="<?= $t['url'] ?>" target="_blank" style="color:#00eaff">Open</a></td>
            <td>
                <a href="edit_tutorial.php?id=<?= $t['id'] ?>" class="btn">Edit</a>
                <a href="delete_tutorial.php?id=<?= $t['id'] ?>" class="btn" style="background:#ff4444;color:white;">Delete</a>
            </td>
        </tr>
        <?php } ?>
    </table>

</div>

</body>
</html>
