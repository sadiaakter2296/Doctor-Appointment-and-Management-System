<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create a test user for development
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@dams.com',
            'password' => bcrypt('password123'),
        ]);

        User::create([
            'name' => 'Dr. John Smith',
            'email' => 'doctor@dams.com',
            'password' => bcrypt('doctor123'),
        ]);

        User::create([
            'name' => 'Nurse Jane',
            'email' => 'nurse@dams.com',
            'password' => bcrypt('nurse123'),
        ]);
    }
}
