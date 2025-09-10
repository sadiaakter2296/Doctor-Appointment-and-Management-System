<?php

require 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Doctor;

// Check if doctors exist
$doctorCount = Doctor::count();
echo "Current doctor count: $doctorCount\n";

// If no doctors, create some test data
if ($doctorCount == 0) {
    echo "Creating test doctors...\n";
    
    Doctor::create([
        'name' => 'Dr. John Smith',
        'email' => 'john.smith@example.com',
        'phone' => '+1234567890',
        'specialty' => 'Cardiology',
        'education' => 'MBBS, MD Cardiology',
        'experience' => 15,
        'fee' => 500.00,
        'location' => 'City Hospital',
        'status' => 'Available',
        'about' => 'Experienced cardiologist with 15 years of practice.',
        'languages' => ['English', 'Spanish'],
        'working_hours' => [
            'monday' => ['start' => '09:00', 'end' => '17:00'],
            'tuesday' => ['start' => '09:00', 'end' => '17:00'],
            'wednesday' => ['start' => '09:00', 'end' => '17:00'],
            'thursday' => ['start' => '09:00', 'end' => '17:00'],
            'friday' => ['start' => '09:00', 'end' => '17:00'],
            'saturday' => ['start' => '09:00', 'end' => '14:00'],
            'sunday' => ['start' => 'closed', 'end' => 'closed']
        ]
    ]);

    Doctor::create([
        'name' => 'Dr. Sarah Johnson',
        'email' => 'sarah.johnson@example.com',
        'phone' => '+1234567891',
        'specialty' => 'Neurology',
        'education' => 'MBBS, MD Neurology',
        'experience' => 12,
        'fee' => 600.00,
        'location' => 'Medical Center',
        'status' => 'Available',
        'about' => 'Specialist in neurological disorders and brain surgery.',
        'languages' => ['English', 'French'],
        'working_hours' => [
            'monday' => ['start' => '10:00', 'end' => '18:00'],
            'tuesday' => ['start' => '10:00', 'end' => '18:00'],
            'wednesday' => ['start' => '10:00', 'end' => '18:00'],
            'thursday' => ['start' => '10:00', 'end' => '18:00'],
            'friday' => ['start' => '10:00', 'end' => '18:00'],
            'saturday' => ['start' => 'closed', 'end' => 'closed'],
            'sunday' => ['start' => 'closed', 'end' => 'closed']
        ]
    ]);
    
    echo "Test doctors created successfully!\n";
}

// List all doctors
$doctors = Doctor::all();
echo "All doctors:\n";
foreach ($doctors as $doctor) {
    echo "- {$doctor->name} ({$doctor->specialty})\n";
}
