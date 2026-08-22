<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * AdminAuthController
 * --------------------
 * Deliberately simple: one fixed admin account defined in .env
 * (ADMIN_EMAIL / ADMIN_PASSWORD), checked on login and tracked via PHP
 * session (not Sanctum tokens — no "admins" DB table needed for this
 * project's scope). This is intentionally separate from AuthController
 * (which handles customer register/login/OTP with Sanctum tokens) so a
 * customer session and an admin session never mix.
 */
class AdminAuthController extends Controller
{
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Invalid input.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $adminEmail = env('ADMIN_EMAIL');
        $adminPassword = env('ADMIN_PASSWORD');

        if ($request->email !== $adminEmail || $request->password !== $adminPassword) {
            return response()->json([
                'message' => 'Invalid email or password.',
            ], 401);
        }

        // Regenerate session id on login to prevent session fixation.
        $request->session()->regenerate();
        $request->session()->put('is_admin', true);
        $request->session()->put('admin_email', $adminEmail);

        return response()->json([
            'message' => 'Login successful.',
            'admin' => ['email' => $adminEmail],
        ]);
    }

    public function logout(Request $request)
    {
        $request->session()->forget(['is_admin', 'admin_email']);
        $request->session()->regenerate();

        return response()->json(['message' => 'Logged out.']);
    }

    public function me(Request $request)
    {
        if (! $request->session()->get('is_admin')) {
            return response()->json(['message' => 'Not logged in.'], 401);
        }

        return response()->json([
            'admin' => ['email' => $request->session()->get('admin_email')],
        ]);
    }
}
