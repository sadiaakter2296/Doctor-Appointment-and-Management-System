<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Doctor;
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
            'status' => 'in:pending,confirmed,cancelled,completed'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            // Check if appointment slot is available
            $existingAppointment = Appointment::where('doctor_id', $request->doctor_id)
                ->where('appointment_date', $request->appointment_date)
                ->where('appointment_time', $request->appointment_time)
                ->where('status', '!=', 'cancelled')
                ->first();

            if ($existingAppointment) {
                return response()->json(['error' => 'This time slot is already booked'], 422);
            }

            $appointment = Appointment::create($request->all());
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

            $appointment->update($request->all());
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

            $appointment->update(['status' => $request->status]);
            return response()->json($appointment->load(['doctor', 'patient']));
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update appointment status'], 500);
        }
    }
}
