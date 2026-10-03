<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Services\JwtService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * JwtAuth
 * -------
 * Registered as the 'jwt.auth' alias in app/Http/Kernel.php. Checks the
 * Authorization: Bearer <token> header for a valid JWT, resolves the
 * user, and attaches it to the request.
 *
 * Now the SINGLE auth mechanism shared by both customer and technician
 * routes (admin still uses its own session-based middleware). An
 * optional $role parameter restricts which user type may pass:
 *
 *   Route::middleware('jwt.auth:customer')->group(...)
 *   Route::middleware('jwt.auth:provider')->group(...)
 *
 * Omit the parameter to accept a JWT for any role. The resolved user is
 * attached under a generic key ('jwt_user') plus a role-specific key
 * ('customer' / 'technician') so existing controllers that already read
 * $request->attributes->get('technician') keep working unchanged.
 */
class JwtAuth
{
    public function handle(Request $request, Closure $next, ?string $role = null): Response
    {
        $header = $request->header('Authorization', '');

        if (! str_starts_with($header, 'Bearer ')) {
            return response()->json(['message' => 'Missing or invalid Authorization header.'], 401);
        }

        $jwt = substr($header, 7);

        $token = (new JwtService())->parseAndValidate($jwt);

        if (! $token) {
            return response()->json(['message' => 'Invalid or expired token.'], 401);
        }

        $userId = $token->claims()->get('sub');
        $tokenRole = $token->claims()->get('role');
        $user = User::find($userId);

        if (! $user || ($role !== null && $tokenRole !== $role)) {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }

        $request->attributes->set('jwt_user', $user);

        // Backwards-compatible aliases for existing controller code.
        $request->attributes->set(
            $user->role === 'provider' ? 'technician' : 'customer',
            $user
        );

        return $next($request);
    }
}
