<?php
$host = "127.0.0.1";   // use 127.0.0.1 instead of localhost
$user = "root";
$pass = "";             // default XAMPP password
$db   = "ai_talent_db";
$port = 3307;           // your confirmed MySQL port

$conn = new mysqli($host, $user, $pass, $db, $port);
// DEPRECATED: Groq API Key should be stored in .env file, NOT in source code!
// Load from environment variable instead:
$GROQ_API_KEY = getenv('GROQ_API_KEY') ?: '';


// Connection test
if ($conn->connect_error) {
    die("❌ Database Connection Failed: " . $conn->connect_error);
} else {
    echo "";
}
?>

