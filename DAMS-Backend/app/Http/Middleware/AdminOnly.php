<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminOnly
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();
        
        if (!$token) {
            return response()->json([
                'status' => 'error',
                'message' => 'Access denied - Admin authentication required'
            ], 401);
        }

        $user = \App\Models\User::where('remember_token', $token)->first();
        
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid token'
            ], 401);
        }

        // Only allow the fixed admin email with admin role
        if ($user->role !== 'admin' || $user->email !== 'admin@hospital.com') {
            return response()->json([
                'status' => 'error',
                'message' => 'Access denied - Admin privileges required'
            ], 403);
        }

        return $next($request);
    }
}
