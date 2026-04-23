<?php
session_start();
header("Content-Type: application/json");
require "config.php";
require "career_skills.php";

$data = json_decode(file_get_contents("php://input"), true);

$role = $data['role'];
$question = $data['question'];
$answer = $data['answer'];
$difficulty = $data['difficulty'];
$skills = $careerSkills[$role];

$prompt = "
Evaluate this candidate's answer.

Career: $role
Difficulty: $difficulty
Skills: $skills
Question: $question
Answer: $answer

Return ONLY JSON:
{
  \"evaluation\": \"...\",
  \"score\": number
}
";

$payload = json_encode([
    "model" => "llama-3.3-70b-versatile",
    "messages" => [
        ["role" => "user", "content" => $prompt]
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

$content = $data["choices"][0]["message"]["content"];

preg_match('/\{(?:[^{}]|(?R))*\}/', $content, $match);

$result = json_decode($match[0], true);

// Insert into DB here (optional depending on your setup)

echo json_encode(["id" => rand(1000,9999)]);
?>
