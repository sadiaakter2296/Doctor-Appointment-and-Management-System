<?php

try {
    $pdo = new PDO('mysql:host=localhost;dbname=clinic_amp', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $stmt = $pdo->query('SELECT id, name, email, phone FROM patients ORDER BY id LIMIT 10');
    $patients = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Patients in database: " . count($patients) . "\n";
    
    foreach($patients as $patient) {
        echo "ID: " . $patient['id'] . ", Name: " . $patient['name'] . ", Email: " . $patient['email'] . "\n";
    }
    
} catch (PDOException $e) {
    echo "Database error: " . $e->getMessage() . "\n";
}