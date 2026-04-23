<?php
session_start();
require 'config.php';

// Fetch all aptitude categories
$cats = $conn->query("SELECT id, title FROM aptitude_categories ORDER BY id ASC");
?>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Aptitude Categories</title>
<style>
    body { background:#000; color:white; font-family:Arial; }
    .container { width:90%; margin:auto; padding:20px; }
    h1 { font-size:32px; margin-bottom:20px; }
    .cat-box {
        background:#111;
        padding:18px 25px;
        border-radius:14px;
        margin:12px 0;
        font-size:20px;
        display:block;
        width:300px;
        color:#bfff00;
        text-decoration:none;
        border:1px solid #333;
        transition:0.3s;
    }
    .cat-box:hover {
        background:#1a1a1a;
        transform:translateX(6px);
    }
</style>
</head>
<body>

<div class="container">
    <h1>Aptitude Categories</h1>

    <?php while($row = $cats->fetch_assoc()): ?>
        <a class="cat-box" href="aptitudes.php?category_id=<?= $row['id'] ?>">
            <?= $row['title'] ?>
        </a>
    <?php endwhile; ?>
</div>

</body>
</html>
