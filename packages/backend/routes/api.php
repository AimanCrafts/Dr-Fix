<?php

use App\Http\Controllers\AddressController;
use App\Http\Controllers\AdminAuthController;
use App\Http\Controllers\AdminTechnicianController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\TechnicianAuthController;
use App\Http\Controllers\TechnicianBookingController;
use App\Http\Controllers\UsersController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// ---- Customer Auth (public) ----
Route::post('/register', [AuthController::class, 'register']);
Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/resend-otp', [AuthController::class, 'resendOtp']);
Route::post('/login', [AuthController::class, 'login']);

// ---- Customer Auth (protected: requires Bearer JWT from login) ----
// Was 'auth:sanctum' — now shares the same JWT middleware as technician
// routes below, scoped to role=customer via the ':customer' parameter.
Route::middleware('jwt.auth:customer')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);

    // Saved addresses — used by both the checkout address picker and
    // the "Saved Addresses" section on the customer dashboard.
    Route::get('/addresses', [AddressController::class, 'index']);
    Route::post('/addresses', [AddressController::class, 'store']);
    Route::put('/addresses/{id}', [AddressController::class, 'update']);
    Route::post('/addresses/{id}/default', [AddressController::class, 'makeDefault']);
    Route::delete('/addresses/{id}', [AddressController::class, 'destroy']);

    // Booking creation + the customer's own booking history/status.
    // Replaces the fake client-side booking ID checkout.jsx used to
    // generate — see BookingController.
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::get('/bookings/{id}', [BookingController::class, 'show']);
});

// Dummy CRUD operations for items using UsersController
Route::get('/items', [UsersController::class, 'index']);
Route::get('/items/{id}', [UsersController::class, 'show']);
Route::post('/items', [UsersController::class, 'store']);
Route::put('/items/{id}', [UsersController::class, 'update']);
Route::patch('/items/{id}', [UsersController::class, 'patch']);
Route::delete('/items/{id}', [UsersController::class, 'destroy']);

/*
|--------------------------------------------------------------------------
| Admin Auth
|--------------------------------------------------------------------------
|
| Uses PHP session (not Sanctum tokens) — kept completely separate from
| the customer auth above so an admin session and a customer session
| never overlap or get mixed up in the same browser.
|
| Wrapped in the 'web' middleware group so session/cookies actually work
| here (the default 'api' group above is stateless and has no session
| middleware). The React SPA must call these with `credentials: 'include'`.
|
*/
Route::middleware('web')->group(function () {
    Route::post('/admin/login', [AdminAuthController::class, 'login']);
    Route::post('/admin/logout', [AdminAuthController::class, 'logout']);
    Route::get('/admin/me', [AdminAuthController::class, 'me']);

    // Provider (technician) applications — list + approve/reject.
    // AdminTechnicianController handles all of these; each approve/reject
    // call also sends the applicant an email (see AdminTechnicianController).
    Route::middleware('admin.auth')->group(function () {
        Route::get('/admin/dashboard-summary', function () {
            return response()->json(['message' => 'Admin-only data goes here.']);
        });

        Route::get('/admin/technicians', [AdminTechnicianController::class, 'index']);
        Route::get('/admin/technicians/{id}', [AdminTechnicianController::class, 'show']);
        Route::post('/admin/technicians/{id}/approve', [AdminTechnicianController::class, 'approve']);
        Route::post('/admin/technicians/{id}/reject', [AdminTechnicianController::class, 'reject']);
    });
});

/*
|--------------------------------------------------------------------------
| Technician Auth
|--------------------------------------------------------------------------
|
| Uses JWT (not Sanctum, not session) — a third, separate auth mechanism
| from the customer (Sanctum) and admin (session) routes above.
|
| No OTP step here (unlike customer signup) — identity is verified by the
| admin manually reviewing the NID upload via the /admin/technicians
| routes above, which is stronger than an email OTP anyway. register()
| stamps email_verified_at immediately; the account then sits at
| approval_status = 'pending' until an admin approves/rejects it.
|
| The React SPA sends this token as `Authorization: Bearer <token>` on
| every protected technician request (no cookie/credentials involved).
|
*/
Route::post('/technician/register', [TechnicianAuthController::class, 'register']);
Route::post('/technician/login', [TechnicianAuthController::class, 'login']);

Route::middleware('jwt.auth:provider')->group(function () {
    Route::get('/technician/me', [TechnicianAuthController::class, 'me']);
    Route::post('/technician/logout', [TechnicianAuthController::class, 'logout']);

    // Incoming job requests (matched by service_category) + accepting one.
    // See TechnicianBookingController for how the "multiple technicians,
    // same request" race is resolved — no reservation/timer involved.
    Route::get('/technician/bookings/available', [TechnicianBookingController::class, 'available']);
    Route::get('/technician/bookings/mine', [TechnicianBookingController::class, 'mine']);
    Route::post('/technician/bookings/{id}/accept', [TechnicianBookingController::class, 'accept']);
    Route::post('/technician/bookings/{id}/on-the-way', [TechnicianBookingController::class, 'onTheWay']);
    Route::post('/technician/bookings/{id}/arrived', [TechnicianBookingController::class, 'arrived']);
    Route::post('/technician/bookings/{id}/start', [TechnicianBookingController::class, 'start']);
    Route::post('/technician/bookings/{id}/complete', [TechnicianBookingController::class, 'complete']);
});