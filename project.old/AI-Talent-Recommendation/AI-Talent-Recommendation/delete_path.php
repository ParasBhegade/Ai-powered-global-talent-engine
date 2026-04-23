<?php
require 'config.php';
session_start();

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    header("Location: login.php");
    exit();
}

$id = $_GET['id'] ?? 0;
if ($id > 0) {
    $conn->query("DELETE FROM career_paths WHERE id=$id");
}
header("Location: admin_dashboard.php");
exit();
?>
