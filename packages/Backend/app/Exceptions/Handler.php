<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Symfony\Component\HttpFoundation\Exception\BadRequestException;
use Throwable;

class Handler extends ExceptionHandler
{
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });

        $this->renderable(function (BadRequestException $e, $request) {
            return response()->json(['message' => $e->getMessage()], 400);
        });

        // Always answer /api/* requests with JSON (404 stays 404,
        // 422 stays 422, 401 stays 401 ...).
        $this->shouldRenderJsonWhen(function ($request, Throwable $e) {
            return $request->is('api/*') || $request->expectsJson();
        });
    }

    // IMPORTANT: the old render() override was removed. It converted EVERY
    // exception (404 route-not-found, 422 validation, 401 auth ...) into
    // a generic HTTP 500 "An unexpected error occurred". Laravel's default
    // renderer already returns the right status code and, when
    // APP_DEBUG=false, hides internal details automatically.
}
