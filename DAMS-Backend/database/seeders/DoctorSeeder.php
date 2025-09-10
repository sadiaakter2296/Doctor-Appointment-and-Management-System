<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Doctor;

class DoctorSeeder extends Seeder
{
    public function run()
    {
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
            'languages' => json_encode(['English', 'Spanish']),
            'working_hours' => json_encode([
                'monday' => ['start' => '09:00', 'end' => '17:00'],
                'tuesday' => ['start' => '09:00', 'end' => '17:00'],
                'wednesday' => ['start' => '09:00', 'end' => '17:00'],
                'thursday' => ['start' => '09:00', 'end' => '17:00'],
                'friday' => ['start' => '09:00', 'end' => '17:00'],
                'saturday' => ['start' => '09:00', 'end' => '14:00'],
                'sunday' => ['start' => 'closed', 'end' => 'closed']
            ])
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
            'languages' => json_encode(['English', 'French']),
            'working_hours' => json_encode([
                'monday' => ['start' => '10:00', 'end' => '18:00'],
                'tuesday' => ['start' => '10:00', 'end' => '18:00'],
                'wednesday' => ['start' => '10:00', 'end' => '18:00'],
                'thursday' => ['start' => '10:00', 'end' => '18:00'],
                'friday' => ['start' => '10:00', 'end' => '18:00'],
                'saturday' => ['start' => 'closed', 'end' => 'closed'],
                'sunday' => ['start' => 'closed', 'end' => 'closed']
            ])
        ]);
    }
}
