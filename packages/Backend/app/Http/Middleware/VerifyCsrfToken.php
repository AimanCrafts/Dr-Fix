<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * Admin auth routes are excluded because they're plain fetch() calls
     * from the React SPA (not a Blade form), so there's no CSRF token to
     * send. If this file already has other entries, just add the
     * 'api/admin/*' line below to your existing array instead of
     * replacing the whole file.
     *
     * @var array<int, string>
     */
    protected $except = [
        'api/admin/*',
    ];
}