<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DoctorController;
use App\Http\Controllers\AppointmentController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Auth routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

// Doctor routes
Route::apiResource('doctors', DoctorController::class);

// Appointment routes
Route::apiResource('appointments', AppointmentController::class);
Route::get('appointments/doctor/{doctorId}', [AppointmentController::class, 'getByDoctor']);
Route::get('appointments/patient/{patientEmail}', [AppointmentController::class, 'getByPatient']);
Route::put('appointments/{id}/status', [AppointmentController::class, 'updateStatus']);
