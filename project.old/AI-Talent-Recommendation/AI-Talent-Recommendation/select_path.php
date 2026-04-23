<?php
session_start();
include "config.php";

if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit();
}

$user_id = $_SESSION['user_id'];
$path_id = $_POST['path_id'];

$stmt = $conn->prepare("UPDATE users SET selected_path=? WHERE id=?");
$stmt->bind_param("ii", $path_id, $user_id);
$stmt->execute();

$_SESSION['selected_path'] = $path_id;

// Redirect directly to skills page
header("Location: skills.php");
exit();
?>
