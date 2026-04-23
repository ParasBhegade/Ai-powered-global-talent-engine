<?php
// ai_interview_batch_api.php
header("Content-Type: application/json");
session_start();
require "config.php";
require "career_skills.php";

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);

$role = $input['role'] ?? '';
$difficulty = $input['difficulty'] ?? '';
$questions = $input['questions'] ?? [];
$answers = $input['answers'] ?? [];

if (!$role || !$difficulty || !is_array($questions) || !is_array($answers) || count($questions) !== count($answers)) {
    echo json_encode(["error" => "Invalid payload"]);
    exit;
}

$skills = $careerSkills[$role] ?? '';

$prompt = "
You are an expert interviewer and evaluator.

Career: $role
Skills: $skills
Difficulty: $difficulty

For each of the following questions and candidate answers, provide:
- evaluation (1–2 sentences)
- score (0–10)

Return STRICT JSON:
{
  \"results\": [
    {\"question\":\"...\",\"answer\":\"...\",\"evaluation\":\"...\",\"score\": number},
    ...
  ],
  \"overall_score\": number,
  \"suggestions\": [\"...\",\"...\"],
  \"progress_level\": \"Beginner|Intermediate|Advanced\"
}

Questions and Answers:
";

for ($i = 0; $i < count($questions); $i++) {
    $q = addslashes($questions[$i]);
    $a = addslashes($answers[$i]);
    $prompt .= "\nQ: $q\nA: $a\n";
}

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
if (!isset($data["choices"][0]["message"]["content"])) {
    echo json_encode(["error" => "Invalid AI response", "raw" => $response]);
    exit;
}

$content = $data["choices"][0]["message"]["content"];
preg_match('/\{(?:[^{}]|(?R))*\}/', $content, $match);
if (empty($match)) {
    echo json_encode(["error" => "JSON parse error", "raw" => $content]);
    exit;
}

$result = json_decode($match[0], true);

// ---- CREATE SESSION ID ----
$session_id = uniqid("sess_");
$user_id = $_SESSION['user_id'];

// ---- SAVE TO DATABASE ----
if (!empty($result['results'])) {
    foreach ($result['results'] as $r) {

        $stmt = $conn->prepare("
            INSERT INTO ai_interview_results
            (session_id, user_id, job_role, difficulty, question, user_answer, ai_feedback, ai_score)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $score = (int)($r['score'] ?? 0);

        $stmt->bind_param(
            "sisssssi",
            $session_id,
            $user_id,
            $role,
            $difficulty,
            $r['question'],
            $r['answer'],
            $r['evaluation'],
            $score
        );

        $stmt->execute();
    }
}

// ---- RETURN SESSION ID FOR RESULTS PAGE ----
echo json_encode([
    "session_id" => $session_id,
    "overall_score" => $result['overall_score'] ?? 0,
    "suggestions" => $result['suggestions'] ?? [],
    "progress_level" => $result['progress_level'] ?? '',
    "results" => $result['results'] ?? []
]);
?>
