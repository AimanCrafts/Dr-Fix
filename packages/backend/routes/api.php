<?php

use App\Http\Controllers\AdminAuthController;
use App\Http\Controllers\AuthController;
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

// ---- Customer Auth (protected: requires Bearer token from login) ----
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
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

    // Example of a protected admin route — apply 'admin.auth' to any
    // future admin-only endpoint (dashboard stats, approvals, etc).
    Route::middleware('admin.auth')->group(function () {
        Route::get('/admin/dashboard-summary', function () {
            return response()->json(['message' => 'Admin-only data goes here.']);
        });
    });
});
