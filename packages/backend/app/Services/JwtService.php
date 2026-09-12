<?php

namespace App\Services;

use Lcobucci\Clock\SystemClock;
use Lcobucci\JWT\Configuration;
use Lcobucci\JWT\Signer\Hmac\Sha256;
use Lcobucci\JWT\Signer\Key\InMemory;
use Lcobucci\JWT\Token\Plain;
use Lcobucci\JWT\Validation\Constraint\SignedWith;
use Lcobucci\JWT\Validation\Constraint\StrictValidAt;

/**
 * JwtService
 * ----------
 * Small wrapper around lcobucci/jwt (v4.3, already in composer.json —
 * no new package installed) used ONLY for technician auth. Customer auth
 * still uses Laravel Sanctum tokens, admin auth still uses PHP sessions —
 * three different mechanisms is intentional here: each user type's auth
 * was built independently as this project evolved, and technician auth
 * specifically demonstrates JWT.
 *
 * Requires JWT_SECRET in .env — a long random string, NOT your app key.
 */
class JwtService
{
    protected Configuration $config;

    public function __construct()
    {
        $secret = env('JWT_SECRET');

        if (! $secret) {
            throw new \RuntimeException('JWT_SECRET is not set in .env');
        }

        $this->config = Configuration::forSymmetricSigner(
            new Sha256(),
            InMemory::plainText($secret)
        );
    }

    /**
     * Issue a signed JWT for a technician user. Returns the token string
     * to send back to the frontend (stored in localStorage there, same
     * pattern as the Sanctum token for customers).
     */
    public function issueToken(int $userId, string $role, int $expiresInMinutes = 60 * 24 * 7): string
    {
        $now = new \DateTimeImmutable();

        $token = $this->config->builder()
            ->issuedBy(config('app.url'))
            ->issuedAt($now)
            ->canOnlyBeUsedAfter($now)
            ->expiresAt($now->modify("+{$expiresInMinutes} minutes"))
            ->relatedTo((string) $userId)
            ->withClaim('role', $role)
            ->getToken($this->config->signer(), $this->config->signingKey());

        return $token->toString();
    }

    /**
     * Parse + validate a raw JWT string (from the Authorization header).
     * Returns the parsed token on success, or null if invalid/expired/
     * signed with the wrong key.
     */
    public function parseAndValidate(string $jwt): ?Plain
    {
        try {
            /** @var Plain $token */
            $token = $this->config->parser()->parse($jwt);
        } catch (\Throwable $e) {
            return null;
        }

        $constraints = [
            new SignedWith($this->config->signer(), $this->config->signingKey()),
            new StrictValidAt(SystemClock::fromUTC()),
        ];

        if (! $this->config->validator()->validate($token, ...$constraints)) {
            return null;
        }

        return $token;
    }
}