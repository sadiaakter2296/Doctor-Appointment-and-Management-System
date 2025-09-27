<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class AppointmentController extends Controller
{
    public function index(): JsonResponse
    {
        try {
            $appointments = Appointment::with(['doctor', 'patient'])->get();
            return response()->json($appointments);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch appointments'], 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'doctor_id' => 'required|exists:doctors,id',
            'patient_id' => 'nullable|exists:patients,id',
            'patient_name' => 'required|string|max:255',
            'patient_email' => 'required|email|max:255',
            'patient_phone' => 'required|string|max:20',
            'appointment_date' => 'required|date|after_or_equal:today',
            'appointment_time' => 'required|date_format:H:i',
            'reason' => 'nullable|string|max:1000',
            'age' => 'nullable|integer|min:1|max:120',
            'gender' => 'nullable|string|in:Male,Female,Other',
            'blood_type' => 'nullable|string|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
            'status' => 'in:pending,confirmed,cancelled,completed'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            // Check if appointment slot is available for this doctor
            $existingDoctorAppointment = Appointment::where('doctor_id', $request->doctor_id)
                ->where('appointment_date', $request->appointment_date)
                ->where('appointment_time', $request->appointment_time)
                ->where('status', '!=', 'cancelled')
                ->first();

            if ($existingDoctorAppointment) {
                return response()->json(['error' => 'Already booked this schedule. Select another time.'], 422);
            }

            // Check if patient already has an appointment at the same date and time (with any doctor)
            $existingPatientAppointment = Appointment::where('patient_email', $request->patient_email)
                ->where('appointment_date', $request->appointment_date)
                ->where('appointment_time', $request->appointment_time)
                ->where('status', '!=', 'cancelled')
                ->first();

            if ($existingPatientAppointment) {
                return response()->json(['error' => 'You already have an appointment at this time. Please select a different time slot.'], 422);
            }

            $appointment = Appointment::create($request->all());
            
            // Try to find or create patient record (optional, doesn't fail appointment creation)
            try {
                $patient = Patient::where('email', $request->patient_email)->first();
                
                if (!$patient) {
                    // Calculate date of birth from age if provided
                    $dateOfBirth = '1990-01-01'; // Default
                    if ($request->age && is_numeric($request->age)) {
                        $currentYear = now()->year;
                        $birthYear = $currentYear - (int) $request->age;
                        $dateOfBirth = $birthYear . '-01-01'; // Use January 1st as approximate
                    }
                    
                    // Create new patient record from appointment data
                    $patient = Patient::create([
                        'name' => $request->patient_name,
                        'email' => $request->patient_email,
                        'phone' => $request->patient_phone,
                        'date_of_birth' => $dateOfBirth,
                        'gender' => $request->gender ?? 'Unknown',
                        'address' => 'Not provided',
                        'blood_type' => $request->blood_type ?? 'Unknown',
                        'emergency_contact' => $request->patient_phone,
                        'emergency_contact_name' => 'Not provided',
                        'status' => 'Active'
                    ]);
                    
                    // Update appointment with patient_id
                    $appointment->update(['patient_id' => $patient->id]);
                }
            } catch (\Exception $patientError) {
                // Log the error but don't fail the appointment creation
                \Log::warning('Failed to create patient record: ' . $patientError->getMessage());
            }
            
            // Create notification for new appointment
            try {
                Notification::createAppointmentNotification('appointment_created', $appointment->load(['doctor', 'patient']));
            } catch (\Exception $notificationError) {
                // Log the error but don't fail the appointment creation
                \Log::error('Failed to create appointment notification: ' . $notificationError->getMessage());
            }
            
            return response()->json($appointment->load(['doctor', 'patient']), 201);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to create appointment'], 500);
        }
    }

    public function show($id): JsonResponse
    {
        try {
            $appointment = Appointment::with(['doctor', 'patient'])->find($id);
            
            if (!$appointment) {
                return response()->json(['error' => 'Appointment not found'], 404);
            }

            return response()->json($appointment);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch appointment'], 500);
        }
    }

    public function update(Request $request, $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'doctor_id' => 'sometimes|required|exists:doctors,id',
            'patient_name' => 'sometimes|required|string|max:255',
            'patient_email' => 'sometimes|required|email|max:255',
            'patient_phone' => 'sometimes|required|string|max:20',
            'appointment_date' => 'sometimes|required|date|after_or_equal:today',
            'appointment_time' => 'sometimes|required|date_format:H:i',
            'reason' => 'nullable|string|max:1000',
            'status' => 'sometimes|in:pending,confirmed,cancelled,completed'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $appointment = Appointment::find($id);
            
            if (!$appointment) {
                return response()->json(['error' => 'Appointment not found'], 404);
            }

            // If updating date/time/doctor, check for conflicts
            if ($request->has('appointment_date') || $request->has('appointment_time') || $request->has('doctor_id')) {
                $appointmentDate = $request->appointment_date ?? $appointment->appointment_date;
                $appointmentTime = $request->appointment_time ?? $appointment->appointment_time;
                $doctorId = $request->doctor_id ?? $appointment->doctor_id;
                $patientEmail = $request->patient_email ?? $appointment->patient_email;

                // Check if appointment slot is available for this doctor (excluding current appointment)
                $existingDoctorAppointment = Appointment::where('doctor_id', $doctorId)
                    ->where('appointment_date', $appointmentDate)
                    ->where('appointment_time', $appointmentTime)
                    ->where('status', '!=', 'cancelled')
                    ->where('id', '!=', $id) // Exclude current appointment
                    ->first();

                if ($existingDoctorAppointment) {
                    return response()->json(['error' => 'Already booked this schedule. Select another time.'], 422);
                }

                // Check if patient already has an appointment at the same date and time (excluding current appointment)
                $existingPatientAppointment = Appointment::where('patient_email', $patientEmail)
                    ->where('appointment_date', $appointmentDate)
                    ->where('appointment_time', $appointmentTime)
                    ->where('status', '!=', 'cancelled')
                    ->where('id', '!=', $id) // Exclude current appointment
                    ->first();

                if ($existingPatientAppointment) {
                    return response()->json(['error' => 'You already have an appointment at this time. Please select a different time slot.'], 422);
                }
            }

            $appointment->update($request->all());
            
            // Create notification for appointment update
            try {
                Notification::createAppointmentNotification('appointment_updated', $appointment->load(['doctor', 'patient']));
            } catch (\Exception $notificationError) {
                // Log the error but don't fail the appointment update
                \Log::error('Failed to create appointment update notification: ' . $notificationError->getMessage());
            }
            
            return response()->json($appointment->load(['doctor', 'patient']));
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update appointment'], 500);
        }
    }

    public function destroy($id): JsonResponse
    {
        try {
            $appointment = Appointment::find($id);
            
            if (!$appointment) {
                return response()->json(['error' => 'Appointment not found'], 404);
            }

            $appointment->delete();
            return response()->json(['message' => 'Appointment deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete appointment'], 500);
        }
    }

    public function getByDoctor($doctorId): JsonResponse
    {
        try {
            $appointments = Appointment::where('doctor_id', $doctorId)
                ->with(['doctor', 'patient'])
                ->orderBy('appointment_date')
                ->orderBy('appointment_time')
                ->get();

            return response()->json($appointments);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch doctor appointments'], 500);
        }
    }

    public function getByPatient($patientEmail): JsonResponse
    {
        try {
            $appointments = Appointment::where('patient_email', $patientEmail)
                ->with(['doctor', 'patient'])
                ->orderBy('appointment_date')
                ->orderBy('appointment_time')
                ->get();

            return response()->json($appointments);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch patient appointments'], 500);
        }
    }

    public function updateStatus(Request $request, $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,confirmed,cancelled,completed'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $appointment = Appointment::find($id);
            
            if (!$appointment) {
                return response()->json(['error' => 'Appointment not found'], 404);
            }

            $oldStatus = $appointment->status;
            $appointment->update(['status' => $request->status]);
            
            // Create notification for status change
            try {
                $notificationType = 'appointment_' . $request->status;
                Notification::createAppointmentNotification($notificationType, $appointment->load(['doctor', 'patient']));
            } catch (\Exception $notificationError) {
                // Log the error but don't fail the status update
                \Log::error('Failed to create status change notification: ' . $notificationError->getMessage());
            }
            
            return response()->json($appointment->load(['doctor', 'patient']));
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update appointment status'], 500);
        }
    }
}
