<?php

namespace App\Http\Controllers;

use App\Models\Doctor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DoctorController extends Controller
{
    public function index()
    {
        try {
            $doctors = Doctor::all();
            return response()->json([
                'status' => 'success',
                'data' => $doctors
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch doctors'
            ], 500);
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    public function store(Request $request)
    {
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:doctors,email',
            'phone' => 'required|string|max:20',
            'specialty' => 'required|string|max:255',
            'education' => 'required|string',
            'experience' => 'required|integer|min:0',
            'fee' => 'required|numeric|min:0',
            'location' => 'required|string|max:255',
            'status' => 'nullable|in:Available,Busy,Offline',
            'about' => 'nullable|string',
            'languages' => 'nullable|array',
            'working_hours' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Set default status if not provided
            $data = $request->all();
            if (!isset($data['status']) || empty($data['status'])) {
                $data['status'] = 'Available';
            }
            
            $doctor = Doctor::create($data);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Doctor created successfully',
                'data' => $doctor
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Doctor creation failed: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create doctor: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Doctor $doctor)
    {
        return response()->json([
            'success' => true,
            'data' => $doctor
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Doctor $doctor)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Doctor $doctor)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:doctors,email,' . $doctor->id,
            'phone' => 'required|string|max:20',
            'specialty' => 'required|string|max:255',
            'education' => 'required|string|max:255',
            'experience' => 'required|integer|min:0',
            'fee' => 'required|numeric|min:0',
            'location' => 'required|string|max:255',
            'status' => 'required|in:Available,Busy,Offline',
            'about' => 'nullable|string',
            'languages' => 'nullable|array',
            'working_hours' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()
            ], 422);
        }

        try {
            $doctor->update($request->all());

            return response()->json([
                'status' => 'success',
                'message' => 'Doctor updated successfully',
                'data' => $doctor
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update doctor'
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Doctor $doctor)
    {
        try {
            $doctor->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Doctor deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete doctor'
            ], 500);
        }
    }
}
