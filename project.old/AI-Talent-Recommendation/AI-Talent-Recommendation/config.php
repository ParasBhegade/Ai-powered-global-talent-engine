<?php
$host = "127.0.0.1";   // use 127.0.0.1 instead of localhost
$user = "root";
$pass = "";             // default XAMPP password
$db   = "ai_talent_db";
$port = 3307;           // your confirmed MySQL port

$conn = new mysqli($host, $user, $pass, $db, $port);
$GROQ_API_KEY = "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";



// Connection test
if ($conn->connect_error) {
    die("❌ Database Connection Failed: " . $conn->connect_error);
} else {
    echo "";
}
?>

