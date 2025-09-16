<?php

// Simple test to check if registration endpoint works
$url = 'http://localhost:8000/api/register';
$data = [
    'name' => 'Test User',
    'email' => 'test@example.com',
    'password' => 'password123',
    'password_confirmation' => 'password123'
];

$options = [
    'http' => [
        'header' => "Content-type: application/json\r\n",
        'method' => 'POST',
        'content' => json_encode($data)
    ]
];

$context = stream_context_create($options);
$result = file_get_contents($url, false, $context);

if ($result === FALSE) {
    echo "Error occurred during request\n";
} else {
    echo "Response: " . $result . "\n";
}

// Also check what headers were returned
if (isset($http_response_header)) {
    echo "Response headers:\n";
    foreach ($http_response_header as $header) {
        echo $header . "\n";
    }
}
?>