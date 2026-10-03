<?php

namespace App\Http\Controllers;

use App\Mail\OtpMail;
use App\Models\Otp;
use App\Models\User;
use App\Services\JwtService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

/**
 * AuthController
 * --------------
 * Customer register/login/OTP. Login now issues a JWT via JwtService
 * (role = 'customer') instead of a Sanctum token, mirroring
 * TechnicianAuthController's pattern — Sanctum is no longer used
 * anywhere in this app after this change (see User model note).
 */
class AuthController extends Controller
{
    
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'     => 'required|string|max:100',
            'email'    => 'required|email|unique:users,email',
            'phone'    => 'nullable|string|max:20',
            'password' => ['required', 'confirmed', Password::min(8)],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'phone'    => $request->phone,
            'password' => Hash::make($request->password),
        ]);

        $this->generateAndSendOtp($user->email);

        return response()->json([
            'message' => 'Account created. Please verify the OTP sent to your email.',
            'email'   => $user->email,
        ], 201);
    }

    
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code'  => 'required|digits:6',
        ]);

        $otp = Otp::where('email', $request->email)
            ->where('code', $request->code)
            ->where('is_used', false)
            ->latest()
            ->first();

        if (!$otp) {
            return response()->json(['message' => 'Invalid OTP code.'], 422);
        }

        if ($otp->expires_at->isPast()) {
            return response()->json(['message' => 'This OTP has expired. Please request a new one.'], 422);
        }

        
        $otp->update(['is_used' => true]);

        
        $user = User::where('email', $request->email)->firstOrFail();
        $user->update(['email_verified_at' => now()]);

        return response()->json(['message' => 'Verification successful.']);
    }

    
    public function resendOtp(Request $request)
    {
        $request->validate(['email' => 'required|email|exists:users,email']);

        $this->generateAndSendOtp($request->email);

        return response()->json(['message' => 'A new OTP has been sent.']);
    }

    
    public function login(Request $request)
    {
        $request->validate([
            'identifier' => 'required|string', // email or phone from the login form
            'password'   => 'required|string',
        ]);

        $user = User::where('email', $request->identifier)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials.'], 401);
        }

        if (!$user->email_verified_at) {
            return response()->json(['message' => 'Please verify your email before logging in.'], 403);
        }


        $token = (new JwtService())->issueToken($user->id, 'customer');

        return response()->json([
            'message' => 'Login successful.',
            'token'   => $token,
            'user'    => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
            ],
        ]);
    }

    /**
     * JWTs are stateless — there's no server-side token to revoke, so
     * this just confirms the request was authenticated (via jwt.auth)
     * and tells the frontend it's fine to drop the token client-side.
     * Same pattern as TechnicianAuthController::logout().
     */
    public function logout(Request $request)
    {
        return response()->json(['message' => 'Logged out. Please remove the token client-side.']);
    }

    
    public function me(Request $request)
    {
        return response()->json($request->attributes->get('customer'));
    }

    /**
     * PUT /api/profile
     * Updates the same fields collected at signup (name, email, phone).
     * Password changes are intentionally NOT handled here — that would
     * need a separate current-password check, kept out of scope.
     */
    public function updateProfile(Request $request)
    {
        $customer = $request->attributes->get('customer');

        $validator = Validator::make($request->all(), [
            'name'  => 'required|string|max:100',
            'email' => 'required|email|unique:users,email,' . $customer->id,
            'phone' => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $customer->update($request->only(['name', 'email', 'phone']));

        return response()->json($customer->fresh());
    }


    
    private function generateAndSendOtp(string $email): void
    {
        $code = (string) random_int(100000, 999999);

        Otp::create([
            'email'      => $email,
            'code'       => $code,
            'expires_at' => now()->addMinutes(5),
        ]);

        Mail::to($email)->send(new OtpMail($code));
    }
}