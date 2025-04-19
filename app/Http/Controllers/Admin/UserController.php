<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display a listing of the users.
     */
    public function index(): Response
    {
        $users = User::with('role')->get();
        $roles = Role::all();

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'roles' => $roles,
        ]);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role_id' => 'required|exists:roles,id',
        ]);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role_id' => $request->role_id
        ]);

        return redirect()->route('admin.users.index');
    }

    /**
     * Update the specified user's role.
     */
    public function updateRole(Request $request, User $user): RedirectResponse
    {
        Log::info('Updating user role', [
            'user_id' => $user->id,
            'current_role_id' => $user->role_id,
            'new_role_id' => $request->role_id,
            'request_data' => $request->all()
        ]);

        $request->validate([
            'role_id' => 'required|exists:roles,id', // Changed from _id to id based on your log
        ]);

        try {
            // For MongoDB, let's be extra explicit and use the raw update method
            $result = $user->update([
                'role_id' => $request->role_id,
            ]);

            Log::info('User role update result', [
                'result' => $result,
                'user_after_update' => $user->fresh()
            ]);

            return redirect()->route('admin.users.index');
        } catch (\Exception $e) {
            Log::error('Error updating user role', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', 'Error updating user role: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(User $user): RedirectResponse
    {
        // Empêcher la suppression de son propre compte via cette méthode
        if ($user->id === auth()->id()) {
            return back()->with('error', 'Vous ne pouvez pas supprimer votre propre compte par cette méthode.');
        }

        $user->delete();

        return redirect()->route('admin.users.index');
    }
}
