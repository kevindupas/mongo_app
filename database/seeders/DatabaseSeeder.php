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
        // Create roles and permissions
        $this->call(RolePermissionSeeder::class);

        // Create admin user
        $this->call(AdminSeeder::class);

        // Create standard users
        $this->call(UserSeeder::class);
    }
}
