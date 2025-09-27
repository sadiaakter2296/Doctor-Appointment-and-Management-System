<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        // Log the incoming request data for debugging
        \Log::info('Registration attempt:', $request->all());
        
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);
        
        if ($validator->fails()) {
            \Log::error('Registration validation failed:', $validator->errors()->toArray());
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()
            ], 422);
        }
        
        try {
            $user = new User();
            $user->name = $request->name;
            $user->email = $request->email;
            $user->password = Hash::make($request->password);
            $user->role = 'patient'; // Always create new registrations as patients
            $user->save();

            \Log::info('User created successfully:', ['id' => $user->id, 'email' => $user->email]);

            // Generate a simple token for authentication
            $token = Str::random(60);
            $user->remember_token = $token;
            $user->save();

            \Log::info('Registration successful for user:', ['id' => $user->id, 'email' => $user->email]);

            return response()->json([
                'status' => 'success',
                'message' => 'User registered successfully',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->role,
                    ],
                    'token' => $token
                ]
            ], 201);
            
        } catch (\Exception $e) {
            \Log::error('Registration failed with exception:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json([
                'status' => 'error',
                'message' => 'Registration failed: ' . $e->getMessage()
            ], 500);
        }

    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()
            ], 422);
        }

        $credentials = $request->only('email', 'password');
        $user = User::where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid credentials'
            ], 401);
        }

        // Generate a simple token for authentication
        $token = Str::random(60);
        $user->remember_token = $token;
        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Login successful',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ],
                'token' => $token
            ]
        ], 200);
    }

    public function logout(Request $request)
    {
        $token = $request->bearerToken();
        
        if ($token) {
            $user = User::where('remember_token', $token)->first();
            if ($user) {
                $user->remember_token = null;
                $user->save();
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Logged out successfully'
        ], 200);
    }

    public function user(Request $request)
    {
        $token = $request->bearerToken();
        
        if (!$token) {
            return response()->json([
                'status' => 'error',
                'message' => 'No token provided'
            ], 401);
        }

        $user = User::where('remember_token', $token)->first();
        
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid token'
            ], 401);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ]
            ]
        ], 200);
    }
}

