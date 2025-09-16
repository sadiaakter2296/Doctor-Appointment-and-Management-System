<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class PatientController extends Controller
{
    /**
     * Display a listing of patients.
     */
    public function index(): JsonResponse
    {
        try {
            $patients = Patient::with('doctor')->orderBy('created_at', 'desc')->get();
            return response()->json([
                'status' => 'success',
                'data' => $patients
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error fetching patients',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created patient.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validatedData = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:patients,email',
                'phone' => 'required|string|max:20',
                'date_of_birth' => 'required|date',
                'gender' => 'required|in:Male,Female,Other',
                'blood_type' => 'nullable|string|max:5',
                'address' => 'required|string',
                'emergency_contact' => 'required|string|max:20',
                'emergency_contact_name' => 'nullable|string|max:255',
                'status' => 'sometimes|in:Active,Inactive',
                'medical_history' => 'nullable|string',
                'allergies' => 'nullable|string',
                'insurance_provider' => 'nullable|string|max:255',
                'insurance_policy_number' => 'nullable|string|max:255',
                'doctor_id' => 'nullable|exists:doctors,id',
                'booking_reason' => 'nullable|string',
                'preferred_appointment_date' => 'nullable|date',
                'appointment_status' => 'sometimes|in:Pending,Confirmed,Completed,Cancelled'
            ]);

            $patient = Patient::create($validatedData);
            $patient->load('doctor');

            // If appointment details are provided, create an appointment
            if ($validatedData['doctor_id'] && $validatedData['preferred_appointment_date']) {
                $appointmentData = [
                    'patient_id' => $patient->id,
                    'doctor_id' => $validatedData['doctor_id'],
                    'patient_name' => $patient->name,
                    'patient_email' => $patient->email,
                    'patient_phone' => $patient->phone,
                    'appointment_date' => date('Y-m-d', strtotime($validatedData['preferred_appointment_date'])),
                    'appointment_time' => date('H:i:s', strtotime($validatedData['preferred_appointment_date'])),
                    'reason' => $validatedData['booking_reason'] ?? '',
                    'status' => strtolower($validatedData['appointment_status'] ?? 'pending')
                ];

                try {
                    $appointment = \App\Models\Appointment::create($appointmentData);
                    $patient->appointment_created = true;
                    \Log::info('Appointment created automatically for patient', ['patient_id' => $patient->id, 'appointment_id' => $appointment->id]);
                } catch (\Exception $appointmentError) {
                    \Log::error('Failed to create appointment for patient', ['error' => $appointmentError->getMessage()]);
                    // Don't fail the patient creation if appointment creation fails
                }
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Patient created successfully',
                'data' => $patient
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error creating patient',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified patient.
     */
    public function show(Patient $patient): JsonResponse
    {
        try {
            return response()->json([
                'status' => 'success',
                'data' => $patient->load(['appointments', 'doctor'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error fetching patient',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified patient.
     */
    public function update(Request $request, Patient $patient): JsonResponse
    {
        try {
            $validatedData = $request->validate([
                'name' => 'sometimes|required|string|max:255',
                'email' => 'sometimes|required|email|unique:patients,email,' . $patient->id,
                'phone' => 'sometimes|required|string|max:20',
                'date_of_birth' => 'sometimes|required|date',
                'gender' => 'sometimes|required|in:Male,Female,Other',
                'blood_type' => 'nullable|string|max:5',
                'address' => 'sometimes|required|string',
                'emergency_contact' => 'sometimes|required|string|max:20',
                'emergency_contact_name' => 'nullable|string|max:255',
                'status' => 'sometimes|in:Active,Inactive',
                'medical_history' => 'nullable|string',
                'allergies' => 'nullable|string',
                'insurance_provider' => 'nullable|string|max:255',
                'insurance_policy_number' => 'nullable|string|max:255',
                'doctor_id' => 'nullable|exists:doctors,id',
                'booking_reason' => 'nullable|string',
                'preferred_appointment_date' => 'nullable|date',
                'appointment_status' => 'sometimes|in:Pending,Confirmed,Completed,Cancelled'
            ]);

            $patient->update($validatedData);
            $patient->load('doctor');

            return response()->json([
                'status' => 'success',
                'message' => 'Patient updated successfully',
                'data' => $patient
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error updating patient',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified patient.
     */
    public function destroy(Patient $patient): JsonResponse
    {
        try {
            $patient->delete();

            return response()->json([
                'message' => 'Patient deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error deleting patient',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Search patients by name, email, or phone.
     */
    public function search(Request $request): JsonResponse
    {
        try {
            $query = $request->get('query', '');
            
            $patients = Patient::where('name', 'like', "%{$query}%")
                ->orWhere('email', 'like', "%{$query}%")
                ->orWhere('phone', 'like', "%{$query}%")
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json($patients);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error searching patients',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
