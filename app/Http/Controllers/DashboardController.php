<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Show the dashboard.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $isAdmin = $user->hasPermission('create') && $user->hasPermission('edit');

        $data = [
            'isAdmin' => $isAdmin,
        ];

        // Add user count for admin users
        if ($isAdmin) {
            $data['userCount'] = User::count();
        }

        return Inertia::render('dashboard', $data);
    }
}
