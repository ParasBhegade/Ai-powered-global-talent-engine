<?php
require "config.php";

$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => "https://api.groq.com/openai/v1/models",
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        "Authorization: Bearer $GROQ_API_KEY"
    ]
]);
$res = curl_exec($ch);
curl_close($ch);
echo $res;
?>
