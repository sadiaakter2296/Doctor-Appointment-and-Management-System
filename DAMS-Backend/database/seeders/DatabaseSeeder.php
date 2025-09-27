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
        // Create the fixed admin user - only this user can access admin panel
        User::updateOrCreate(
            ['email' => 'admin@hospital.com'],
            [
                'name' => 'System Administrator',
                'password' => bcrypt('admin123456'),
                'role' => 'admin'
            ]
        );

        echo "Fixed admin account created:\n";
        echo "Email: admin@hospital.com\n";
        echo "Password: admin123456\n";
        echo "Role: admin\n\n";
        echo "All new registrations will automatically be 'patient' role.\n";
    }
}
