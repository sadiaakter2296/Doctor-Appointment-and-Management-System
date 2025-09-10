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
            $patients = Patient::orderBy('created_at', 'desc')->get();
            return response()->json($patients);
        } catch (\Exception $e) {
            return response()->json([
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
                'insurance_policy_number' => 'nullable|string|max:255'
            ]);

            $patient = Patient::create($validatedData);

            return response()->json([
                'message' => 'Patient created successfully',
                'patient' => $patient
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
            return response()->json($patient->load('appointments'));
        } catch (\Exception $e) {
            return response()->json([
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
                'insurance_policy_number' => 'nullable|string|max:255'
            ]);

            $patient->update($validatedData);

            return response()->json([
                'message' => 'Patient updated successfully',
                'patient' => $patient
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
