<?php
session_start();
require "../config.php";

if (!isset($_SESSION['admin_id'])) { 
    header("Location: admin_login.php"); 
    exit;
}

$paths = mysqli_query($conn, "SELECT * FROM career_paths");

if (isset($_POST['add'])) {
    $title = $_POST['title'];
    $url = $_POST['url'];
    $summary = $_POST['summary'];
    $path = $_POST['path'];

    mysqli_query($conn, 
        "INSERT INTO tutorials (career_path_id, title, url, summary)
         VALUES ('$path', '$title', '$url', '$summary')"
    );

    header("Location: tutorials_admin.php");
    exit;
}
?>
<!DOCTYPE html>
<html>
<head>
<title>Add Tutorial</title>
<style>
body{
    margin:0;
    font-family:Poppins;
    background:#0b0018;
    color:white;
}
.form-box {
    width:50%;
    margin:auto;
    margin-top:50px;
    background:#ffffff0d;
    padding:25px;
    border-radius:15px;
    backdrop-filter:blur(10px);
}
input, textarea, select {
    width:100%;
    padding:12px;
    margin-top:10px;
    border:none;
    border-radius:8px;
}
button{
    margin-top:20px;
    padding:12px 20px;
    background:#00eaff;
    border:none;
    border-radius:8px;
    font-size:16px;
    font-weight:bold;
    cursor:pointer;
}
</style>
</head>
<body>

<div class="form-box">
<h2>Add Tutorial</h2>

<form method="POST">
    <label>Career Path</label>
    <select name="path" required>
        <option value="">Select Path</option>
        <?php while($p = mysqli_fetch_assoc($paths)) { ?>
        <option value="<?= $p['id'] ?>"><?= $p['name'] ?></option>
        <?php } ?>
    </select>

    <label>Title</label>
    <input type="text" name="title" required>

    <label>URL</label>
    <input type="text" name="url" required>

    <label>Summary</label>
    <textarea name="summary" rows="4"></textarea>

    <button type="submit" name="add">Add Tutorial</button>
</form>
</div>

</body>
</html>
