<?php
// check_embeds.php
// Place in same folder as config.php and open in browser (http://localhost/.../check_embeds.php)

require 'config.php'; // must set $conn (mysqli)
set_time_limit(120);

$q = "SELECT id, title, url FROM tutorials ORDER BY id";
$res = mysqli_query($conn, $q);
$bad = [];

echo "<pre style='font-family:monospace;'>Checking tutorial URLs via YouTube oEmbed...\n\n";

while ($row = mysqli_fetch_assoc($res)) {
    $id = (int)$row['id'];
    $url = trim($row['url']);
    $title = $row['title'];

    if (empty($url)) {
        echo "ID {$id}  [MISSING URL]  - {$title}\n";
        $bad[] = $id;
        continue;
    }

    // build oembed url
    $oembed = 'https://www.youtube.com/oembed?url=' . urlencode($url) . '&format=json';

    // simple cURL request
    $ch = curl_init($oembed);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_USERAGENT, 'EmbedChecker/1.0');
    curl_exec($ch);

    $http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($http === 200) {
        echo "ID {$id}  [OK]               - {$title}\n";
    } else {
        // non-200 -> not embeddable or error
        echo "ID {$id}  [NOT EMBEDDABLE]   (HTTP {$http}) - {$title}\n    URL: {$url}\n";
        $bad[] = $id;
    }
}

echo "\n\nSummary: ".count($bad)." problematic rows: ";
if (count($bad)) echo implode(', ', $bad);
else echo "None — all good!";
echo "\n</pre>";
