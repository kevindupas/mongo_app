<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RoleController extends Controller
{
    /**
     * Display a listing of the roles.
     */
    public function index(): Response
    {
        $roles = Role::all();
        $permissions = Permission::all();

        return Inertia::render('admin/roles/index', [
            'roles' => $roles,
            'permissions' => $permissions,
        ]);
    }

    /**
     * Store a newly created role in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:roles,name',
            'permissions' => 'required|array',
            'permissions.*' => 'exists:permissions,_id',
        ]);

        $role = Role::create([
            'name' => $request->name,
        ]);

        // Assign permissions to role
        $permissions = Permission::whereIn('_id', $request->permissions)->get();
        foreach ($permissions as $permission) {
            $role->permissions()->create([
                'name' => $permission->name,
            ]);
        }

        return redirect()->route('admin.roles.index');
    }

    /**
     * Update the specified role in storage.
     */
    public function update(Request $request, Role $role): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:roles,name,' . $role->id,
            'permissions' => 'required|array',
            'permissions.*' => 'exists:permissions,_id',
        ]);

        $role->update([
            'name' => $request->name,
        ]);

        // For MongoDB embedded documents, we need to directly manipulate the permissions array
        // rather than using the relationship methods like delete()

        // First, we'll get the permissions data
        $permissionsData = [];
        $permissions = Permission::whereIn('_id', $request->permissions)->get();
        foreach ($permissions as $permission) {
            $permissionsData[] = [
                'name' => $permission->name,
            ];
        }

        // Update the role with the new permissions array
        $role->unset('permissions'); // Remove the existing permissions array
        $role->save();

        // Now add the new permissions
        foreach ($permissionsData as $permData) {
            $role->permissions()->create($permData);
        }

        return redirect()->route('admin.roles.index');
    }

    /**
     * Remove the specified role from storage.
     */
    public function destroy(Role $role): RedirectResponse
    {
        // Check if there are users with this role
        $usersWithRole = \App\Models\User::where('role_id', $role->_id)->count();

        if ($usersWithRole > 0) {
            return back()->with('error', 'Cannot delete role because it is assigned to users.');
        }

        // Delete the role
        $role->delete();

        return redirect()->route('admin.roles.index');
    }
}
