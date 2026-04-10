<?php

namespace Database\Seeders;

use App\Models\Profile;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $adminEmail = env('ADMIN_SEED_EMAIL', 'admin@example.com');
        $adminName  = env('ADMIN_SEED_NAME', 'Admin');
        $adminSlug  = env('ADMIN_SEED_USERNAME', 'admin');

        $user = User::firstOrCreate(
            ['email' => $adminEmail],
            [
                'name' => $adminName,
                'password' => Hash::make('changeme'),
                'email_verified_at' => now(),
            ]
        );

        Profile::firstOrCreate(
            ['id' => $user->id],
            [
                'username' => $adminSlug,
                'email' => $user->email,
                'plan' => 'free',
                'role' => 'admin',
            ]
        );
    }
}
