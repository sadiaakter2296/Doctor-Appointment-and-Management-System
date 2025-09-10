<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Auth::routes(); // Commented out to avoid conflicts with API routes

Route::get('/home', [App\Http\Controllers\HomeController::class, 'index'])->name('home');
