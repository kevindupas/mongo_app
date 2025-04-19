<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Faker\Factory as Faker;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();
        $userRole = Role::where('name', 'user')->first();

        // Si le rôle user n'existe pas encore, on le crée
        if (!$userRole) {
            $userRole = Role::create(['name' => 'user']);
            $userRole->permissions()->create(['name' => 'view']);
        }

        // Création de 5 utilisateurs standards
        for ($i = 1; $i <= 5; $i++) {
            User::create([
                'name' => $faker->name,
                'email' => 'user' . $i . '@example.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'role_id' => $userRole->_id,
            ]);
        }

        // Utilisateur de test spécifique pour faciliter la connexion
        User::updateOrCreate(
            ['email' => 'user@example.com'],
            [
                'name' => 'Test User',
                'email' => 'user@example.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'role_id' => $userRole->_id,
            ]
        );
    }
}
