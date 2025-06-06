<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PermissionController extends Controller
{
    /**
     * Display a listing of permissions.
     */
    public function index(): Response
    {
        $permissions = Permission::all();

        return Inertia::render('admin/permissions/index', [
            'permissions' => $permissions,
        ]);
    }

    /**
     * Store a newly created permission in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:permissions,name',
        ]);

        Permission::create([
            'name' => $request->name,
        ]);

        return redirect()->route('admin.permissions.index');
    }

    /**
     * Remove the specified permission from storage.
     */
    public function destroy(Permission $permission): RedirectResponse
    {
        // For MongoDB, we need to check embedded documents differently
        // Instead of using whereHas, we'll use where with elemMatch
        $rolesWithPermission = \App\Models\Role::where('permissions', 'elemMatch', [
            'name' => $permission->name
        ])->count();

        if ($rolesWithPermission > 0) {
            return back()->with('error', 'Cannot delete permission because it is used by roles.');
        }

        // Delete the permission
        $permission->delete();

        return redirect()->route('admin.permissions.index');
    }
}
