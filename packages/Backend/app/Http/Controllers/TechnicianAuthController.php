<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\JwtService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

/**
 * TechnicianAuthController
 * -------------------------
 * register() collects provider-only fields + NID file upload, sets
 * role = 'provider', approval_status = 'pending'.
 *
 * Unlike AuthController (customer), this does NOT send an OTP. Identity
 * here is verified by the admin manually reviewing the NID upload +
 * approving/rejecting the application (see AdminTechnicianController) —
 * an email OTP would be redundant on top of that. So email_verified_at
 * is stamped immediately at registration, and login only checks
 * password + (implicitly) that the account exists.
 *
 * login() issues a JWT (via JwtService) instead of a Sanctum token, and
 * succeeds regardless of approval_status — the frontend routes a
 * 'pending' provider to an "Application Under Review" page rather than
 * the dashboard. Blocking login entirely at 'pending' would stop them
 * from ever checking their approval status.
 */
class TechnicianAuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'fullName'             => 'required|string|max:100',
            'email'                => 'required|email|unique:users,email',
            'phone'                => 'nullable|string|max:20',
            'password'             => ['required', 'confirmed', Password::min(8)],
            'serviceCategory'      => 'required|string|max:100',
            'yearsOfExperience'    => 'required|integer|min:0|max:60',
            'workArea'             => 'required|string|max:150',
            'nidFile'              => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120', // 5MB
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $nidPath = $request->file('nidFile')->store('nid-uploads', 'public');

        $user = User::create([
            'name'                 => $request->fullName,
            'email'                => $request->email,
            'password'             => Hash::make($request->password),
            'role'                 => 'provider',
            'service_category'     => $request->serviceCategory,
            'years_of_experience'  => $request->yearsOfExperience,
            'work_area'            => $request->workArea,
            'nid_path'             => $nidPath,
            'approval_status'      => 'pending',
            // No OTP step for providers — see class docblock above.
            'email_verified_at'    => now(),
        ]);

        return response()->json([
            'message' => 'Account created. Your application is now pending admin review.',
            'email'   => $user->email,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'identifier' => 'required|string',
            'password'   => 'required|string',
        ]);

        $user = User::where('email', $request->identifier)
            ->where('role', 'provider')
            ->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials.'], 401);
        }

        $token = (new JwtService())->issueToken($user->id, 'provider');

        return response()->json([
            'message'         => 'Login successful.',
            'token'           => $token,
            'approval_status' => $user->approval_status,
            'user'            => [
                'id'               => $user->id,
                'name'             => $user->name,
                'email'            => $user->email,
                'service_category' => $user->service_category,
                'approval_status'  => $user->approval_status,
                'is_available'    => (bool) $user->is_available,
            ],
        ]);
    }

    /**
     * JWTs are stateless — there's no server-side session to destroy, so
     * "logout" here just confirms the request was authenticated (via the
     * jwt.auth middleware) and tells the frontend it's fine to delete the
     * token from localStorage. If a real "invalidate this exact token"
     * requirement comes up later, that needs a token blacklist table,
     * which is intentionally left out for this project's scope.
     */
    public function logout(Request $request)
    {
        return response()->json(['message' => 'Logged out. Please remove the token client-side.']);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->attributes->get('technician');

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'phone' => 'nullable|string|max:20',
            'service_category' => 'required|string|max:100',
            'years_of_experience' => 'required|integer|min:0|max:60',
            'work_area' => 'required|string|max:150',
        ]);

        $user->update($validated);

        return $this->me($request);
    }

    public function availability(Request $request)
    {
        $user = $request->attributes->get('technician');

        $validated = $request->validate([
            'is_available' => 'required|boolean',
        ]);

        $user->update(['is_available' => $validated['is_available']]);

        return response()->json([
            'is_available' => (bool) $user->is_available,
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->attributes->get('technician');

        return response()->json([
            'id'                   => $user->id,
            'name'                 => $user->name,
            'email'                => $user->email,
            'service_category'     => $user->service_category,
            'years_of_experience'  => $user->years_of_experience,
            'work_area'            => $user->work_area,
            'approval_status'      => $user->approval_status,
            'is_available'        => (bool) $user->is_available,
            'phone'              => $user->phone,
        ]);
    }
}
