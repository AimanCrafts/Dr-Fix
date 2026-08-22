<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | UPDATED for session-based admin auth: cookies must be allowed across
    | origins, which means 'allowed_origins' can no longer be '*' — browsers
    | reject wildcard origin when credentials are involved. Replace the
    | value below with your actual frontend dev URL (Vite default shown).
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    // TODO: change this to your real frontend URL(s), e.g. your deployed
    // domain too once you have one. Must be an exact origin, not '*'.
    'allowed_origins' => ['http://localhost:5173'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // Changed to true — required so the browser sends/receives the admin
    // session cookie on cross-origin requests from the React app.
    'supports_credentials' => true,

];
