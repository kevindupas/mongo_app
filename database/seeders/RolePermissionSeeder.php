<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create permissions
        $permissions = ['view', 'create', 'edit'];

        foreach ($permissions as $permission) {
            Permission::updateOrCreate(['name' => $permission]);
        }

        // Create admin role
        $adminRole = Role::updateOrCreate(['name' => 'admin']);

        // Assign permissions to the admin role
        $adminRole->permissions()->createMany([
            ['name' => 'view'],
            ['name' => 'create'],
            ['name' => 'edit'],
        ]);

        // Create user role
        $userRole = Role::updateOrCreate(['name' => 'user']);

        // Assign only view permission to the user role
        $userRole->permissions()->createMany([
            ['name' => 'view'],
        ]);
    }
}
