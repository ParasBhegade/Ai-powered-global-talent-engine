<?php
header("Content-Type: application/json");

require "config.php"; // contains $GROQ_API_KEY

$input = json_decode(file_get_contents("php://input"), true);
$user_msg = $input["message"] ?? "";

if (!$user_msg) {
    echo json_encode(["reply" => "I didn’t receive any message."]);
    exit;
}

$payload = json_encode([
    "model" => "llama-3.3-70b-versatile",
    "messages" => [
        ["role" => "system", "content" => "You are an AI Career Assistant. You must answer ANY question clearly and helpfully, not with sample responses."],
        ["role" => "user", "content" => $user_msg]
    ]
]);

$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => "https://api.groq.com/openai/v1/chat/completions",
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $payload,
    CURLOPT_HTTPHEADER => [
        "Content-Type: application/json",
        "Authorization: Bearer $GROQ_API_KEY"
    ]
]);

$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);

if (!isset($data["choices"][0]["message"]["content"])) {
    echo json_encode(["reply" => "Sorry, AI could not respond."]);
    exit;
}

echo json_encode([
    "reply" => $data["choices"][0]["message"]["content"]
]);
?>
