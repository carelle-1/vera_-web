<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@vera.local'],
            [
                'name' => 'Admin VERA',
                'password' => Hash::make('admin12345'),
                'role' => 'admin',
            ]
        );

        $this->command->info('Admin user created/updated: admin@vera.local');
    }
}
