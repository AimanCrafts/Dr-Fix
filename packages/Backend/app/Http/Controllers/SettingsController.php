<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

/**
 * SettingsController
 * ------------------
 * Account settings shared by customers and technicians. The same methods
 * serve both roles; routes/api.php exposes them under two prefixes
 * (/settings for customers, /technician/settings for technicians), each
 * behind its own jwt.auth:<role> middleware, so a token of one role can
 * never reach the other role's settings.
 */
class SettingsController extends Controller
{
    private function currentUser(Request $request)
    {
        return $request->attributes->get('jwt_user');
    }

    private function validationError($validator)
    {
        return response()->json([
            'message' => $validator->errors()->first(),
            'errors'  => $validator->errors(),
        ], 422);
    }

    /** GET /api/settings  |  GET /api/technician/settings */
    public function show(Request $request)
    {
        $user = $this->currentUser($request);
        $isProvider = $user->role === 'provider';

        return response()->json([
            'account_type'        => $isProvider ? 'technician' : 'customer',
            'member_since'        => $user->created_at,
            'email_notifications' => (bool) $user->email_notifications,
            'service_category'    => $isProvider ? $user->service_category : null,
            'work_area'           => $isProvider ? $user->work_area : null,
            'approval_status'     => $isProvider ? $user->approval_status : null,
            'is_available'        => $isProvider ? (bool) $user->is_available : null,
        ]);
    }

    /** PUT .../settings/password */
    public function changePassword(Request $request)
    {
        $user = $this->currentUser($request);

        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'password'         => ['required', 'confirmed', Password::min(8)],
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator);
        }

        if (! Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Your current password is incorrect.',
                'errors'  => ['current_password' => ['Your current password is incorrect.']],
            ], 422);
        }

        if (Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Your new password must be different from the current one.',
                'errors'  => ['password' => ['Your new password must be different from the current one.']],
            ], 422);
        }

        $user->forceFill(['password' => Hash::make($request->password)])->save();

        return response()->json(['message' => 'Password updated.']);
    }

    /** PUT .../settings/notifications  (customers) */
    public function updateNotifications(Request $request)
    {
        $user = $this->currentUser($request);

        $validator = Validator::make($request->all(), [
            'email_notifications' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator);
        }

        $user->update(['email_notifications' => $request->boolean('email_notifications')]);

        return response()->json([
            'message'             => 'Notification preference saved.',
            'email_notifications' => (bool) $user->email_notifications,
        ]);
    }

    /**
     * POST .../settings/deactivate
     *
     * Deactivation, NOT deletion. bookings/reviews use cascadeOnDelete(), so
     * deleting the user row would wipe booking history and a technician's
     * earnings records. Instead deactivated_at is stamped: login stops
     * working, old tokens are rejected by JwtAuth, and the technician
     * disappears from the public list. Everything else stays intact.
     */
    public function deactivate(Request $request)
    {
        $user = $this->currentUser($request);

        $validator = Validator::make($request->all(), [
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator);
        }

        if (! Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Password is incorrect.',
                'errors'  => ['password' => ['Password is incorrect.']],
            ], 422);
        }

        // Never leave a job half-done behind someone's back.
        $isProvider = $user->role === 'provider';

        $hasActiveJobs = $isProvider
            ? Booking::where('technician_id', $user->id)
                ->whereIn('status', ['accepted', 'in_progress'])->exists()
            : Booking::where('customer_id', $user->id)
                ->whereIn('status', ['pending', 'accepted', 'in_progress'])->exists();

        if ($hasActiveJobs) {
            return response()->json([
                'message' => 'You still have active bookings. Please finish them before deactivating your account.',
            ], 422);
        }

        $user->forceFill([
            'deactivated_at' => now(),
            'is_available'   => false,
        ])->save();

        return response()->json(['message' => 'Your account has been deactivated.']);
    }
}
