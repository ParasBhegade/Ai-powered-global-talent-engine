
<?php
session_start();
require "config.php";

if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit;
}

$user_id = $_SESSION['user_id'];

// Fetch selected path
$q = mysqli_query($conn, "SELECT selected_path FROM users WHERE id=$user_id");
$row = mysqli_fetch_assoc($q);
$career_path_id = $row['selected_path'];

if ($career_path_id == 0) {
    die("<h2 style='color:red;text-align:center;margin-top:40px;'>❗ Please select a career path first.</h2>");
}

// Fetch aptitude questions
$questions = mysqli_query($conn, "SELECT * FROM aptitude_questions WHERE career_path_id=$career_path_id");
$total = mysqli_num_rows($questions);
?>
<!DOCTYPE html>
<html>
<head>
<title>Aptitude Test</title>
<style>
body{
    margin:0;
    font-family:Poppins;
    color:white;
    background: linear-gradient(-45deg,#1f0036,#4b0082,#0a2a43,#001f3f);
    background-size:400% 400%;
    animation: bgMove 15s infinite;
}
@keyframes bgMove{
    0%{background-position:0% 50%;}
    50%{background-position:100% 50%;}
    100%{background-position:0% 50%;}
}
.container{
    width:70%;
    margin:auto;
    padding:30px;
}
.card{
    background:rgba(255,255,255,0.08);
    padding:20px;
    border-radius:15px;
    backdrop-filter:blur(5px);
    margin-bottom:20px;
}
button{
    background:#00eaff;
    padding:12px 20px;
    border:none;
    font-size:18px;
    border-radius:10px;
    cursor:pointer;
    font-weight:700;
}
</style>
</head>
<body>

<div class="container">
<h2>Aptitude Test</h2>

<form method="POST" action="submit_test.php">
<input type="hidden" name="career_path_id" value="<?= $career_path_id ?>">
<input type="hidden" name="total" value="<?= $total ?>">

<?php
$qno = 1;
while ($q = mysqli_fetch_assoc($questions)) {
?>
<div class="card">
    <h3><?= $qno ?>. <?= $q['question'] ?></h3>

    <label><input type="radio" name="q<?= $qno ?>" value="A"> <?= $q['option_a'] ?></label><br>
    <label><input type="radio" name="q<?= $qno ?>" value="B"> <?= $q['option_b'] ?></label><br>
    <label><input type="radio" name="q<?= $qno ?>" value="C"> <?= $q['option_c'] ?></label><br>
    <label><input type="radio" name="q<?= $qno ?>" value="D"> <?= $q['option_d'] ?></label>

    <input type="hidden" name="correct<?= $qno ?>" value="<?= $q['correct_option'] ?>">
</div>
<?php
$qno++;
}
?>

<button type="submit">Submit Test</button>
</form>
</div>

</body>
</html>

