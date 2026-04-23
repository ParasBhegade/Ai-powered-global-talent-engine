<?php
include('config.php');
$error = '';

if (isset($_POST['signup'])) {
    $name = trim($_POST['name']);
    $email = trim($_POST['email']);
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT);
    $role = 'student';

    $check = $conn->query("SELECT * FROM users WHERE email='$email'");
    if ($check->num_rows > 0) {
        $error = "⚠️ Email already registered!";
    } else {
        $sql = "INSERT INTO users (name,email,password,role) VALUES ('$name','$email','$password','$role')";
        if ($conn->query($sql)) {
            header("Location: login.php");
            exit;
        } else {
            $error = "Error: ".$conn->error;
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Signup | AI Talent Platform</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap');
*{margin:0;padding:0;box-sizing:border-box;font-family:'Poppins',sans-serif;}
body{
  height:100vh;display:flex;justify-content:center;align-items:center;
  background:linear-gradient(135deg,#1a0033,#003366,#0099ff);
  background-size:300% 300%;animation:bg 8s infinite alternate;
}
@keyframes bg{from{background-position:left;}to{background-position:right;}}
.card{
  width:400px;background:rgba(255,255,255,0.1);backdrop-filter:blur(10px);
  border:1px solid rgba(255,255,255,0.2);border-radius:18px;padding:40px;text-align:center;
  box-shadow:0 0 25px rgba(0,255,255,0.25);color:#fff;
}
h2{margin-bottom:20px;color:#00eaff;text-shadow:0 0 10px #00eaff;}
input{
  width:100%;padding:12px;margin:10px 0;border:none;border-radius:8px;
  background:rgba(255,255,255,0.12);color:#fff;font-size:15px;
}
input:focus{outline:none;box-shadow:0 0 8px #00eaff;}
button{
  width:100%;padding:12px;border:none;border-radius:8px;margin-top:15px;
  background:linear-gradient(45deg,#00eaff,#8a2be2);color:#fff;font-size:16px;font-weight:600;
  cursor:pointer;transition:.3s;
}
button:hover{transform:scale(1.05);box-shadow:0 0 15px #00eaff;}
a{color:#00eaff;text-decoration:none;}
a:hover{text-decoration:underline;}
.error{color:#ff6b6b;margin-bottom:10px;}
p{margin-top:15px;color:#ccc;}
</style>
</head>
<body>
<div class="card">
  <h2>Create Your Account ✨</h2>
  <?php if($error) echo "<p class='error'>$error</p>"; ?>
  <form method="POST">
    <input type="text" name="name" placeholder="Full Name" required>
    <input type="email" name="email" placeholder="Email Address" required>
    <input type="password" name="password" placeholder="Password" required>
    <button type="submit" name="signup">Sign Up</button>
    <p>Already registered? <a href="login.php">Login</a></p>
  </form>
</div>
</body>
</html>
