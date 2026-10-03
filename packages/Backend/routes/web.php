<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Serve the built React app (Frontend -> Backend/public/app) for every
| non-API path. React Router handles the routing in the browser.
|
*/

Route::get('/{any?}', fn () =>
    response()->file(public_path('app/index.html')))
    ->where('any', '(?!api/|up$).*');