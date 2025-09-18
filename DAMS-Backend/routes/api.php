<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\DoctorController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ReportController;

// Update user endpoint to work with our token system
Route::get('/user', [AuthController::class, 'user']);

// Auth routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

// Doctor routes
Route::apiResource('doctors', DoctorController::class);

// Patient routes
Route::apiResource('patients', PatientController::class);
Route::get('patients/search', [PatientController::class, 'search']);

// Appointment routes
Route::apiResource('appointments', AppointmentController::class);
Route::get('appointments/doctor/{doctorId}', [AppointmentController::class, 'getByDoctor']);
Route::get('appointments/patient/{patientEmail}', [AppointmentController::class, 'getByPatient']);
Route::put('appointments/{id}/status', [AppointmentController::class, 'updateStatus']);

// Notification routes
Route::apiResource('notifications', NotificationController::class)->except(['update']);
Route::put('notifications/{id}/mark-read', [NotificationController::class, 'markAsRead']);
Route::put('notifications/{id}/mark-unread', [NotificationController::class, 'markAsUnread']);
Route::put('notifications/{id}/archive', [NotificationController::class, 'archive']);
Route::put('notifications/{id}/unarchive', [NotificationController::class, 'unarchive']);
Route::put('notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
Route::delete('notifications/bulk-delete', [NotificationController::class, 'bulkDelete']);
Route::get('notifications-stats', [NotificationController::class, 'stats']);

// Billing routes
Route::apiResource('billings', BillingController::class);
Route::post('billings/{id}/mark-paid', [BillingController::class, 'markAsPaid']);
Route::post('billings/{id}/add-payment', [BillingController::class, 'addPayment']);
Route::get('billings-statistics', [BillingController::class, 'statistics']);
Route::get('billings/appointment/{appointmentId}', [BillingController::class, 'getByAppointment']);
Route::post('billings/appointment/{appointmentId}', [BillingController::class, 'createFromAppointment']);

// Report routes
Route::get('reports/patients-with-billing', [ReportController::class, 'getPatientsWithBilling']);
Route::post('reports/generate', [ReportController::class, 'generateReport']);
Route::get('reports/recent', [ReportController::class, 'getRecentReports']);
