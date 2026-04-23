<?php
session_start();
require 'config.php';
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    header("Location: admin_login.php");
    exit();
}
$id = (int)$_GET['id'];
$path_id = (int)$_GET['path_id'];
$msg = "";
$skill = $conn->query("SELECT * FROM skills WHERE id=$id")->fetch_assoc();
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = mysqli_real_escape_string($conn, $_POST['skill_name']);
    $category = mysqli_real_escape_string($conn, $_POST['category']);
    $weight = (int)$_POST['weight'];
    $sql = "UPDATE skills SET skill_name='$name', category='$category', weight=$weight WHERE id=$id";
    if ($conn->query($sql)) $msg = "✅ Updated successfully!";
    else $msg = "❌ Error updating skill!";
}
?>
<!DOCTYPE html>
<html>
<head>
<title>Edit Skill</title>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">
<style>
body{
    margin:0;height:100vh;display:flex;justify-content:center;align-items:center;
    background:linear-gradient(-45deg,#ff6b6b,#feca57,#48dbfb,#1dd1a1);
    background-size:400% 400%;animation:bg 10s ease infinite;font-family:'Poppins';color:#fff;
}
@keyframes bg{0%{background-position:0% 50%;}50%{background-position:100% 50%;}100%{background-position:0% 50%;}}
form{background:rgba(0,0,0,0.4);padding:35px;border-radius:15px;width:400px;box-shadow:0 0 25px rgba(0,255,255,0.3);}
input{width:100%;padding:10px;margin:10px 0;border:none;border-radius:8px;}
button{width:100%;padding:10px;background:linear-gradient(45deg,#00eaff,#8a2be2);border:none;border-radius:8px;font-weight:600;color:#000;}
a{color:#00eaff;text-decoration:none;}
</style>
</head>
<body>
<form method="POST">
<h2>Edit Skill</h2>
<p><?= $msg ?></p>
<input type="text" name="skill_name" value="<?= htmlspecialchars($skill['skill_name']) ?>" required>
<input type="text" name="category" value="<?= htmlspecialchars($skill['category']) ?>" required>
<input type="number" name="weight" value="<?= $skill['weight'] ?>" required>
<button type="submit">Update Skill</button>
<p style="text-align:center;margin-top:10px;"><a href="manage_skills.php?path_id=<?= $path_id ?>">⬅ Back</a></p>
</form>
</body>
</html>
