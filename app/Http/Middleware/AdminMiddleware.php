<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Vérifier simplement si l'utilisateur a le rôle "admin"
        if (!$user || !$user->role || $user->role->name !== 'admin') {
            return redirect()->route('dashboard');
        }

        return $next($request);
    }
}
