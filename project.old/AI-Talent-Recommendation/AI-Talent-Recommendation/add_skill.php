<?php
session_start();
require 'config.php';
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    header("Location: admin_login.php");
    exit();
}
$path_id = (int)$_GET['path_id'];
$msg = "";
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = mysqli_real_escape_string($conn, $_POST['skill_name']);
    $category = mysqli_real_escape_string($conn, $_POST['category']);
    $weight = (int)$_POST['weight'];
    $sql = "INSERT INTO skills (career_path_id, skill_name, category, weight) VALUES ($path_id, '$name', '$category', $weight)";
    if ($conn->query($sql)) $msg = "✅ Skill added!";
    else $msg = "❌ Error adding skill.";
}
?>
<!DOCTYPE html>
<html>
<head>
<title>Add Skill</title>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">
<style>
body{
    margin:0;height:100vh;display:flex;justify-content:center;align-items:center;
    background:linear-gradient(-45deg,#00eaff,#8a2be2,#ff6b6b,#1dd1a1);
    background-size:400% 400%;animation:move 10s ease infinite;font-family:'Poppins';color:#fff;
}
@keyframes move{0%{background-position:0% 50%;}50%{background-position:100% 50%;}100%{background-position:0% 50%;}}
form{background:rgba(0,0,0,0.4);padding:35px;border-radius:15px;width:400px;box-shadow:0 0 25px rgba(0,255,255,0.3);}
input{width:100%;padding:10px;margin:10px 0;border:none;border-radius:8px;}
button{width:100%;padding:10px;background:linear-gradient(45deg,#00eaff,#8a2be2);border:none;border-radius:8px;font-weight:600;color:#000;}
a{color:#00eaff;text-decoration:none;}
</style>
</head>
<body>
<form method="POST">
<h2>Add Skill</h2>
<p><?= $msg ?></p>
<input type="text" name="skill_name" placeholder="Skill Name" required>
<input type="text" name="category" placeholder="Category" required>
<input type="number" name="weight" placeholder="Weight (1-10)" required>
<button type="submit">Add Skill</button>
<p style="text-align:center;margin-top:10px;"><a href="manage_skills.php?path_id=<?= $path_id ?>">⬅ Back</a></p>
</form>
</body>
</html>
