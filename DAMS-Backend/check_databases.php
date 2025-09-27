<?php

try {
    $pdo = new PDO('mysql:host=localhost', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $stmt = $pdo->query('SHOW DATABASES');
    $databases = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo "Available databases:\n";
    foreach($databases as $db) {
        echo "- " . $db . "\n";
    }
    
} catch (PDOException $e) {
    echo "Database error: " . $e->getMessage() . "\n";
}