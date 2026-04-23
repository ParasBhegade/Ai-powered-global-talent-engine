<?php
session_start();
require 'config.php';

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    header("Location: login.php");
    exit();
}

$id = $_GET['id'] ?? 0;
$path = $_GET['path'] ?? 0;
$conn->query("DELETE FROM skills WHERE id=$id");
header("Location: skills.php?path=$path");
exit();
?>
