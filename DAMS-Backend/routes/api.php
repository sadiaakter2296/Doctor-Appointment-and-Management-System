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

// Auth routes (public)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

// Public routes (anyone can view)
Route::get('doctors', [DoctorController::class, 'index']);
Route::get('doctors/{doctor}', [DoctorController::class, 'show']);
Route::get('appointments', [AppointmentController::class, 'index']);
Route::get('appointments/{appointment}', [AppointmentController::class, 'show']);
Route::get('patients', [PatientController::class, 'index']);
Route::get('patients/{patient}', [PatientController::class, 'show']);

// Patient/User routes (booking appointments - requires any authenticated user)
Route::post('appointments', [AppointmentController::class, 'store']);
Route::get('appointments/doctor/{doctorId}', [AppointmentController::class, 'getByDoctor']);
Route::get('appointments/patient/{patientEmail}', [AppointmentController::class, 'getByPatient']);

// Admin-only routes (requires admin@hospital.com)
Route::middleware(['admin.only'])->group(function () {
    // Doctor management
    Route::post('doctors', [DoctorController::class, 'store']);
    Route::put('doctors/{doctor}', [DoctorController::class, 'update']);
    Route::delete('doctors/{doctor}', [DoctorController::class, 'destroy']);
    
    // Patient management
    Route::post('patients', [PatientController::class, 'store']);
    Route::put('patients/{patient}', [PatientController::class, 'update']);
    Route::delete('patients/{patient}', [PatientController::class, 'destroy']);
    Route::get('patients/search', [PatientController::class, 'search']);
    
    // Appointment management
    Route::put('appointments/{appointment}', [AppointmentController::class, 'update']);
    Route::delete('appointments/{appointment}', [AppointmentController::class, 'destroy']);
    Route::put('appointments/{id}/status', [AppointmentController::class, 'updateStatus']);
    
    // Notifications (admin only)
    Route::apiResource('notifications', NotificationController::class)->except(['update']);
    Route::put('notifications/{id}/mark-read', [NotificationController::class, 'markAsRead']);
    Route::put('notifications/{id}/mark-unread', [NotificationController::class, 'markAsUnread']);
    Route::put('notifications/{id}/archive', [NotificationController::class, 'archive']);
    Route::put('notifications/{id}/unarchive', [NotificationController::class, 'unarchive']);
    Route::put('notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::delete('notifications/bulk-delete', [NotificationController::class, 'bulkDelete']);
    Route::get('notifications-stats', [NotificationController::class, 'stats']);
    
    // Billing (admin only)
    Route::apiResource('billings', BillingController::class);
    Route::post('billings/{id}/mark-paid', [BillingController::class, 'markAsPaid']);
    Route::post('billings/{id}/add-payment', [BillingController::class, 'addPayment']);
    Route::get('billings-statistics', [BillingController::class, 'statistics']);
    Route::get('billings/appointment/{appointmentId}', [BillingController::class, 'getByAppointment']);
    Route::post('billings/appointment/{appointmentId}', [BillingController::class, 'createFromAppointment']);
    
    // Reports (admin only)
    Route::get('reports/patients-with-billing', [ReportController::class, 'getPatientsWithBilling']);
    Route::post('reports/generate', [ReportController::class, 'generateReport']);
    Route::get('reports/recent', [ReportController::class, 'getRecentReports']);
});
