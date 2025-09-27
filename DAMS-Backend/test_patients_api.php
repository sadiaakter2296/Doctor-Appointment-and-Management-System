<?php

// Test the patients API endpoint
$url = 'http://localhost:8000/api/patients';

// Get a token from localStorage or create one
$token = 'test_token_for_admin'; // This won't work, let me create a proper admin login

// First, let's try to login as admin
$loginUrl = 'http://localhost:8000/api/login';
$loginData = json_encode([
    'email' => 'admin@hospital.com',
    'password' => 'admin123456'
]);

$context = stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => [
            'Content-Type: application/json',
            'Accept: application/json'
        ],
        'content' => $loginData
    ]
]);

echo "Attempting admin login...\n";
$response = file_get_contents($loginUrl, false, $context);

if ($response === false) {
    echo "Failed to connect to login API\n";
    exit(1);
}

$loginResult = json_decode($response, true);
echo "Login response: " . $response . "\n";

if (!isset($loginResult['status']) || $loginResult['status'] !== 'success') {
    echo "Login failed\n";
    exit(1);
}

$token = $loginResult['data']['token'];
echo "Got token: " . substr($token, 0, 20) . "...\n";

// Now test the patients endpoint
$context = stream_context_create([
    'http' => [
        'method' => 'GET',
        'header' => [
            'Content-Type: application/json',
            'Accept: application/json',
            'Authorization: Bearer ' . $token
        ]
    ]
]);

echo "\nFetching patients...\n";
$response = file_get_contents($url, false, $context);

if ($response === false) {
    echo "Failed to fetch patients\n";
    exit(1);
}

// Now test the notifications endpoint
$notificationsUrl = 'http://localhost:8000/api/notifications';
$context = stream_context_create([
    'http' => [
        'method' => 'GET',
        'header' => [
            'Content-Type: application/json',
            'Accept: application/json',
            'Authorization: Bearer ' . $token
        ]
    ]
]);

echo "\nFetching notifications...\n";
$response = file_get_contents($notificationsUrl, false, $context);

if ($response === false) {
    echo "Failed to fetch notifications\n";
    exit(1);
}

echo "Notifications response: " . $response . "\n";