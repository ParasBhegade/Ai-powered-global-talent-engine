<?php
session_start();
require 'config.php';

// Only Admin Access
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    header("Location: login.php");
    exit();
}

$message = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = mysqli_real_escape_string($conn, $_POST['name']);
    $description = mysqli_real_escape_string($conn, $_POST['description']);

    if (!empty($name) && !empty($description)) {
        $sql = "INSERT INTO career_paths (name, description) VALUES ('$name', '$description')";
        if ($conn->query($sql)) {
            $message = "✅ Path added successfully!";
        } else {
            $message = "❌ Error: " . $conn->error;
        }
    } else {
        $message = "⚠️ All fields are required!";
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Add Career Path | Admin</title>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">
<style>
body{
    font-family:'Poppins',sans-serif;
    background:linear-gradient(-45deg,#0a0a1a,#0d1b2a,#001f3f,#00111f);
    background-size:400% 400%;
    animation:bg 10s ease infinite;
    color:#fff;
}
@keyframes bg{0%{background-position:0% 50%;}50%{background-position:100% 50%;}100%{background-position:0% 50%;}}
.container{
    width:500px;
    margin:80px auto;
    background:rgba(255,255,255,0.05);
    border-radius:15px;
    box-shadow:0 0 25px rgba(0,255,255,0.2);
    padding:30px;
}
h2{color:#00eaff;text-align:center;}
form{display:flex;flex-direction:column;gap:15px;}
input,textarea{
    padding:10px;
    border-radius:8px;
    border:none;
    outline:none;
    background:rgba(255,255,255,0.1);
    color:#fff;
}
button{
    padding:10px;
    border:none;
    border-radius:8px;
    background:linear-gradient(45deg,#00eaff,#8a2be2);
    color:#000;
    font-weight:600;
    cursor:pointer;
}
button:hover{transform:scale(1.05);}
a{color:#00eaff;text-decoration:none;}
.message{text-align:center;margin-top:10px;color:#0ff;}
</style>
</head>
<body>
<div class="container">
<h2>➕ Add New Career Path</h2>
<form method="POST">
    <input type="text" name="name" placeholder="Enter Path Name" required>
    <textarea name="description" rows="4" placeholder="Enter Description" required></textarea>
    <button type="submit">Add Path</button>
</form>
<p class="message"><?= $message ?></p>
<p style="text-align:center;margin-top:15px;"><a href="admin_dashboard.php">⬅ Back to Dashboard</a></p>
</div>
</body>
</html>
