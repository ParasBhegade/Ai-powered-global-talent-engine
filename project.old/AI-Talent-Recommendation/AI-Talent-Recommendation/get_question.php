<?php
// get_questions.php
header("Content-Type: application/json");
require "config.php";
require "career_skills.php";

if (!isset($_GET['role']) || !isset($_GET['difficulty'])) {
    echo json_encode(["error"=>"Missing parameters"]);
    exit;
}
$role = $_GET['role'];
$difficulty = $_GET['difficulty'];
$count = isset($_GET['count']) ? (int)$_GET['count'] : 5;
if ($count < 1) $count = 5;

if (!isset($careerSkills[$role])) {
    echo json_encode(["error"=>"Invalid role"]);
    exit;
}
$skills = $careerSkills[$role];

$prompt = "
Generate EXACTLY $count interview questions as a JSON array for the following career.
Career: $role
Skills: $skills
Difficulty: $difficulty

Return STRICT JSON like:
{ \"questions\": [\"q1\",\"q2\", ...] }
";

$payload = json_encode([
    "model" => "llama-3.3-70b-versatile",
    "messages" => [["role"=>"user","content"=>$prompt]]
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
    echo json_encode(["error"=>"Invalid response","raw"=>$response]);
    exit;
}
$content = $data["choices"][0]["message"]["content"];
preg_match('/\{(?:[^{}]|(?R))*\}/', $content, $match);
if (empty($match)) {
    echo json_encode(["error"=>"Could not extract JSON","raw"=>$content]);
    exit;
}
echo $match[0];
