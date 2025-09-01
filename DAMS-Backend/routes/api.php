<?php

use Illuminate\Support\Facades\Route;

foreach (glob(__DIR__ . '/api/*.php') as $routeFile) {
    require $routeFile;
}

Route::options('/{any}', function () {
    return response('', 200);
})->where('any', '.*');
