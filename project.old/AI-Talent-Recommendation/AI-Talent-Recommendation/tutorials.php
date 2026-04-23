<?php
session_start();
require "config.php";

if (!isset($_GET['path'])) {
    die("<h2 style='color:red;text-align:center;margin-top:40px;'>❗ Invalid career path.</h2>");
}

$path_id = (int)$_GET['path'];

/* -------------------------------
   UNIVERSAL YOUTUBE EXTRACTOR
--------------------------------*/
function extractYT($url) {
    // Matches ALL formats: watch?v= , youtu.be/ , embed/ , shorts/
    $pattern = '%(youtu\.be/|youtube\.com/(watch\?.*v=|embed/|shorts/))([\w-]{11})%i';
    if (preg_match($pattern, $url, $matches)) {
        return $matches[3];
    }
    return "";
}

// Fetch tutorials
$stmt = $conn->prepare("SELECT * FROM tutorials WHERE career_path_id = ?");
$stmt->bind_param("i", $path_id);
$stmt->execute();
$res = $stmt->get_result();

// Fetch career name
$stmt2 = $conn->prepare("SELECT name FROM career_paths WHERE id = ?");
$stmt2->bind_param("i", $path_id);
$stmt2->execute();
$career = $stmt2->get_result()->fetch_assoc();
?>
<!DOCTYPE html>
<html>
<head>
<title><?= $career['name'] ?> Tutorials</title>
<style>
body {
    margin:0;
    background:#021526;
    font-family:Poppins;
    color:white;
}
.card {
    background:rgba(255,255,255,0.06);
    padding:20px;
    border-radius:15px;
    margin:20px auto;
    width:65%;
}
iframe {
    width:100%;
    height:315px;
    border-radius:10px;
    margin-top:15px;
}
.back-btn {
    background:#00eaff;
    padding:10px 15px;
    border-radius:10px;
    display:inline-block;
    text-decoration:none;
    color:black;
    margin:20px;
    font-weight:bold;
}
</style>
</head>

<body>

<a class="back-btn" href="student_dashboard.php">⬅ Back</a>

<h1 style="text-align:center;color:#00eaff;margin-top:20px;">
🎓 <?= $career['name'] ?> — Tutorials
</h1>

<?php
if ($res->num_rows == 0) {
    echo "<p style='text-align:center;margin-top:20px;'>No tutorials found.</p>";
} else {
    while ($row = $res->fetch_assoc()) {

        // Extract video ID
        $vid = extractYT($row['url']);
?>
        
        <div class="card">
            <h2><?= $row['title'] ?></h2>
            <p><?= $row['summary'] ?></p>

            <?php if (!empty($vid)) { ?>
                <iframe src="https://www.youtube.com/embed/<?= $vid ?>" allowfullscreen></iframe>
            <?php } else { ?>
                <p style="color:red;">Invalid YouTube URL: <?= $row['url'] ?></p>
            <?php } ?>
        </div>

<?php 
    } // while end
} // else end
?>

</body>
</html>
