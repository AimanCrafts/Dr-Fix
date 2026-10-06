<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AddressController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\AdminAuthController;
use App\Http\Controllers\AdminTechnicianController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\TechnicianAuthController;
use App\Http\Controllers\TechnicianBookingController;
use App\Http\Controllers\TechnicianDashboardController;
use App\Http\Controllers\SettingsController;

/*
|--------------------------------------------------------------------------
| Customer Auth
|--------------------------------------------------------------------------
*/
Route::post('/register', [AuthController::class, 'register']);
Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/resend-otp', [AuthController::class, 'resendOtp']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('jwt.auth:customer')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);

    Route::get('/settings', [SettingsController::class, 'show']);
    Route::put('/settings/password', [SettingsController::class, 'changePassword'])->middleware('throttle:6,1');
    Route::put('/settings/notifications', [SettingsController::class, 'updateNotifications']);
    Route::post('/settings/deactivate', [SettingsController::class, 'deactivate'])->middleware('throttle:6,1');

    Route::get('/addresses', [AddressController::class, 'index']);
    Route::post('/addresses', [AddressController::class, 'store']);
    Route::put('/addresses/{id}', [AddressController::class, 'update']);
    Route::post('/addresses/{id}/default', [AddressController::class, 'makeDefault']);
    Route::delete('/addresses/{id}', [AddressController::class, 'destroy']);

    Route::post('/bookings', [BookingController::class, 'store']);
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::get('/bookings/{id}', [BookingController::class, 'show']);
    Route::post('/bookings/{bookingId}/review', [ReviewController::class, 'store']);
});

/*
|--------------------------------------------------------------------------
| Public (no login) - home page data
|--------------------------------------------------------------------------
*/
Route::get('/public/reviews', [ReviewController::class, 'recent']);
Route::get('/public/technicians', [AdminTechnicianController::class, 'publicIndex']);

/* Dummy CRUD operations for items using UsersController */
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
*/
Route::middleware('web')->group(function () {
    Route::post('/admin/login', [AdminAuthController::class, 'login']);
    Route::post('/admin/logout', [AdminAuthController::class, 'logout']);
    Route::get('/admin/me', [AdminAuthController::class, 'me']);

    Route::middleware('admin.auth')->group(function () {
        Route::get('/admin/dashboard-summary', [AdminDashboardController::class, 'summary']);

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
*/
Route::post('/technician/register', [TechnicianAuthController::class, 'register']);
Route::post('/technician/login', [TechnicianAuthController::class, 'login']);

Route::middleware('jwt.auth:provider')->group(function () {
    Route::get('/technician/me', [TechnicianAuthController::class, 'me']);
    Route::post('/technician/logout', [TechnicianAuthController::class, 'logout']);
    Route::put('/technician/profile', [TechnicianAuthController::class, 'updateProfile']);

    Route::get('/technician/settings', [SettingsController::class, 'show']);
    Route::put('/technician/settings/password', [SettingsController::class, 'changePassword'])->middleware('throttle:6,1');
    Route::post('/technician/settings/deactivate', [SettingsController::class, 'deactivate'])->middleware('throttle:6,1');
    Route::post('/technician/availability', [TechnicianAuthController::class, 'availability']);

    Route::get('/technician/dashboard-summary', [TechnicianDashboardController::class, 'summary']);
    Route::get('/technician/earnings', [TechnicianDashboardController::class, 'earnings']);
    Route::get('/technician/schedule', [TechnicianDashboardController::class, 'schedule']);

    Route::get('/technician/bookings/available', [TechnicianBookingController::class, 'available']);
    Route::get('/technician/bookings/mine', [TechnicianBookingController::class, 'mine']);
    Route::post('/technician/bookings/{id}/accept', [TechnicianBookingController::class, 'accept']);
    Route::post('/technician/bookings/{id}/reject', [TechnicianBookingController::class, 'reject']);
    Route::post('/technician/bookings/{id}/start', [TechnicianBookingController::class, 'start']);
    Route::post('/technician/bookings/{id}/complete', [TechnicianBookingController::class, 'complete']);
});
