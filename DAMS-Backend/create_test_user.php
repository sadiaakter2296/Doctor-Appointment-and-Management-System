<?php
require_once 'vendor/autoload.php';

use Illuminate\Database\Capsule\Manager as Capsule;
use Illuminate\Support\Facades\Hash;

// Database configuration
$capsule = new Capsule;

$capsule->addConnection([
    'driver' => 'sqlite',
    'database' => __DIR__ . '/database/database.sqlite',
    'prefix' => '',
]);

$capsule->setAsGlobal();
$capsule->bootEloquent();

try {
    // Create a test user
    $userData = [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => password_hash('password123', PASSWORD_DEFAULT),
        'email_verified_at' => date('Y-m-d H:i:s'),
        'created_at' => date('Y-m-d H:i:s'),
        'updated_at' => date('Y-m-d H:i:s')
    ];
    
    // Check if user already exists
    $existingUser = Capsule::table('users')->where('email', 'test@example.com')->first();
    
    if ($existingUser) {
        echo "✅ User test@example.com already exists with ID: " . $existingUser->id . "\n";
    } else {
        $userId = Capsule::table('users')->insertGetId($userData);
        echo "✅ Created test user with ID: $userId\n";
    }
    
    // List all users
    echo "\n📋 All users in database:\n";
    $users = Capsule::table('users')->get();
    foreach ($users as $user) {
        echo "ID: {$user->id}, Name: {$user->name}, Email: {$user->email}\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>