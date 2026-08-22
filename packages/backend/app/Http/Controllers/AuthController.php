<?php

namespace App\Http\Controllers;

use App\Mail\OtpMail;
use App\Models\Otp;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

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

      
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful.',
            'token'   => $token,
            'user'    => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
            ],
        ]);
    }

    
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out.']);
    }

    
    public function me(Request $request)
    {
        return response()->json($request->user());
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
