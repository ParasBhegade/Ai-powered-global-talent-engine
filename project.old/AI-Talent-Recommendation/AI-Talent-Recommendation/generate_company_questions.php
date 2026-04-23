<?php
require "config.php";

echo "<pre>";

// Fetch all topics (with company id)
$sql = "
    SELECT 
        t.id AS topic_id, 
        t.topic_name,
        cat.company_id,
        c.name AS company_name
    FROM company_aptitude_topics t
    JOIN company_aptitude_categories cat ON t.category_id = cat.id
    JOIN companies c ON cat.company_id = c.id
";
$topics = $conn->query($sql);

if (!$topics || $topics->num_rows == 0) {
    die("❌ No topics found. Add topics first.");
}

echo "✔ Topics loaded: " . $topics->num_rows . "\n";


// Prepare insert query
$insert = $conn->prepare("
    INSERT INTO company_aptitude_questions
    (company_id, topic_id, question, option_a, option_b, option_c, option_d, correct_option, explanation)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
");

if (!$insert) {
    die("Prepare failed: " . $conn->error);
}

function correctOpt($i) {
    return ["A","B","C","D"][$i % 4];
}

$totalInserted = 0;

while ($t = $topics->fetch_assoc()) {

    $topic_id = $t['topic_id'];
    $company_id = $t['company_id'];
    $topic_name = $t['topic_name'];
    $company_name = $t['company_name'];

    echo "\nGenerating questions for: {$company_name} → {$topic_name}\n";

    for ($i=1; $i<=10; $i++) {
        $q = "Practice Question {$i} – {$topic_name} ({$company_name})";

        $a = "Option A";
        $b = "Option B";
        $c = "Option C";
        $d = "Option D";

        $correct = correctOpt($i);
        $exp = "Explanation: The correct option is {$correct}.";

        $insert->bind_param(
            "iisssssss",
            $company_id,
            $topic_id,
            $q,
            $a,
            $b,
            $c,
            $d,
            $correct,
            $exp
        );

        if ($insert->execute()) {
            $totalInserted++;
        }
    }
}

echo "\n----------------------------------\n";
echo "✔ DONE! Total questions inserted: {$totalInserted}\n";
echo "----------------------------------\n";

echo "</pre>";
?>
