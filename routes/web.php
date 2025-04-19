<?php

use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Admin routes
    Route::middleware(['admin'])->prefix('admin')->group(function () {
        // Gestion des utilisateurs
        Route::get('users', [App\Http\Controllers\Admin\UserController::class, 'index'])->name('admin.users.index');
        Route::put('users/{user}/update-role', [App\Http\Controllers\Admin\UserController::class, 'updateRole'])->name('admin.users.update-role');
        Route::delete('users/{user}', [App\Http\Controllers\Admin\UserController::class, 'destroy'])->name('admin.users.destroy');

        // Gestion des rôles
        Route::get('roles', [App\Http\Controllers\Admin\RoleController::class, 'index'])->name('admin.roles.index');
        Route::post('roles', [App\Http\Controllers\Admin\RoleController::class, 'store'])->name('admin.roles.store');
        Route::put('roles/{role}', [App\Http\Controllers\Admin\RoleController::class, 'update'])->name('admin.roles.update');
        Route::delete('roles/{role}', [App\Http\Controllers\Admin\RoleController::class, 'destroy'])->name('admin.roles.destroy');

        // Gestion des permissions
        Route::get('permissions', [App\Http\Controllers\Admin\PermissionController::class, 'index'])->name('admin.permissions.index');
        Route::post('permissions', [App\Http\Controllers\Admin\PermissionController::class, 'store'])->name('admin.permissions.store');
        Route::delete('permissions/{permission}', [App\Http\Controllers\Admin\PermissionController::class, 'destroy'])->name('admin.permissions.destroy');
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
