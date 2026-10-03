<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * EnsureAdmin
 * -----------
 * Simple session-based guard for the admin panel. No database "admins"
 * table needed — login just checks the single admin email/password from
 * .env and sets a session flag. This middleware just checks that flag.
 *
 * Registered as the 'admin.auth' alias in app/Http/Kernel.php.
 */
class EnsureAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->session()->get('is_admin')) {
            return response()->json([
                'message' => 'Unauthorized. Admin login required.',
            ], 401);
        }

        return $next($request);
    }
}