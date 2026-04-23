<?php
session_start();
require "config.php";

if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit;
}

$user_id = $_SESSION['user_id'];
$career_path_id = $_POST['career_path_id'];  // ⭐ FIXED

$score = 0;
$weak_topics = [];

$total = $_POST['total'];

for ($i = 1; $i <= $total; $i++) {
    $selected = $_POST["q$i"] ?? "";
    $correct = $_POST["correct$i"];

    if ($selected == $correct) {
        $score++;
    } else {
        $weak_topics[] = "Q$i";
    }
}

$weak_list = implode(", ", $weak_topics);

// ⭐ FIXED INSERT
$query = "INSERT INTO user_scores (user_id, career_path_id, score, total, weak_topics)
          VALUES ('$user_id', '$career_path_id', '$score', '$total', '$weak_list')";

mysqli_query($conn, $query);

// Redirect to result page
header("Location: result.php?score=$score&total=$total&weak=$weak_list&path=$career_path_id");
exit;
?>
