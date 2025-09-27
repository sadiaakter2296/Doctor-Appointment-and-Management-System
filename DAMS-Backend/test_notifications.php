<?php

try {
    $pdo = new PDO('mysql:host=localhost;dbname=clinic_amp', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Check if notifications table exists and has data
    echo "Checking notifications table...\n";
    
    $stmt = $pdo->query('SELECT COUNT(*) FROM notifications');
    $count = $stmt->fetchColumn();
    echo "Total notifications: " . $count . "\n\n";
    
    if ($count > 0) {
        $stmt = $pdo->query('SELECT id, title, message, type, status, created_at FROM notifications ORDER BY created_at DESC LIMIT 5');
        $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo "Recent notifications:\n";
        foreach($notifications as $notif) {
            echo "ID: " . $notif['id'] . " | " . $notif['title'] . " | " . $notif['status'] . " | " . $notif['created_at'] . "\n";
        }
    }
    
    // Create a test notification for admin
    echo "\nCreating test notification...\n";
    $stmt = $pdo->prepare('INSERT INTO notifications (title, message, type, priority, status, user_id, patient_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())');
    $stmt->execute([
        'New Patient Registration',
        'A new patient "Test Patient" has registered and needs approval.',
        'patient_registered',
        'medium',
        'unread',
        null, // Admin notification (no specific user_id)
        20    // Patient mehedi's ID
    ]);
    
    echo "Test notification created with ID: " . $pdo->lastInsertId() . "\n";
    
} catch (PDOException $e) {
    echo "Database error: " . $e->getMessage() . "\n";
}