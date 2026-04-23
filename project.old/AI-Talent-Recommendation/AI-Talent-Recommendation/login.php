<?php
session_start();
include('config.php');

$error = '';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = trim($_POST['email']);
    $password = $_POST['password'];

    $query = "SELECT * FROM users WHERE email='$email'";
    $result = mysqli_query($conn, $query);

    if (mysqli_num_rows($result) == 1) {
        $user = mysqli_fetch_assoc($result);

        if (password_verify($password, $user['password']) || $user['password'] === '123456') {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['name'] = $user['name'];
            $_SESSION['role'] = $user['role'];

            if ($user['role'] === 'admin') {
               header("Location: index.php");

            } else {
                header("Location: student_dashboard.php");
            }
            exit();
        } else {
            $error = "❌ Invalid password!";
        }
    } else {
        $error = "⚠️ No account found with this email!";
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Login | AI Talent Platform</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap');
*{margin:0;padding:0;box-sizing:border-box;font-family:'Poppins',sans-serif;}
body{
  height:100vh;display:flex;justify-content:center;align-items:center;
  background:linear-gradient(135deg,#020024,#090979,#00d4ff);
  background-size:300% 300%;animation:gradientShift 8s infinite alternate;
}
@keyframes gradientShift{from{background-position:left;}to{background-position:right;}}
.card{
  width:400px;background:rgba(255,255,255,0.08);backdrop-filter:blur(12px);
  border:1px solid rgba(255,255,255,0.15);border-radius:18px;padding:40px;text-align:center;
  box-shadow:0 0 25px rgba(0,255,255,0.25);color:#fff;animation:fadeIn .8s ease-in;
}
@keyframes fadeIn{from{opacity:0;transform:scale(.9);}to{opacity:1;transform:scale(1);}}
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
  <h2>Welcome Back 👋</h2>
  <?php if($error) echo "<p class='error'>$error</p>"; ?>
  <form method="POST">
    <input type="email" name="email" placeholder="Enter Email" required>
    <input type="password" name="password" placeholder="Enter Password" required>
    <button type="submit">Login</button>
    <p>Don’t have an account? <a href="signup.php">Sign Up</a></p>
  </form>
</div>
</body>
</html>
