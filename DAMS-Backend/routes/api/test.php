<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Simple test endpoint
Route::get('/test', function () {
    return response()->json([
        'status' => 'success',
        'message' => 'API is working!',
        'timestamp' => now()
    ]);
});

// Health check endpoint
Route::get('/health', function () {
    return response()->json([
        'status' => 'healthy',
        'service' => 'DAMS API',
        'version' => '1.0.0'
    ]);
});
