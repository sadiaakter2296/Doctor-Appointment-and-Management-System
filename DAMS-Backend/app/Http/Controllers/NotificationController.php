<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class NotificationController extends Controller
{
    /**
     * Get all notifications with pagination and filters
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Notification::query()
                ->with(['patient', 'doctor', 'appointment'])
                ->orderBy('created_at', 'desc');

            // Apply filters
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            if ($request->has('type') && $request->type !== 'all') {
                $query->byType($request->type);
            }

            if ($request->has('priority') && $request->priority !== 'all') {
                $query->byPriority($request->priority);
            }

            if ($request->has('user_id')) {
                $query->forUser($request->user_id);
            }

            if ($request->has('search')) {
                $searchTerm = $request->search;
                $query->where(function ($q) use ($searchTerm) {
                    $q->where('title', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('message', 'LIKE', "%{$searchTerm}%");
                });
            }

            // Recent notifications filter
            if ($request->has('recent_days')) {
                $query->recent($request->recent_days);
            }

            $perPage = $request->get('per_page', 15);
            $notifications = $query->paginate($perPage);

            // Add computed properties
            $notifications->getCollection()->transform(function ($notification) {
                $notification->time_ago = $notification->time_ago;
                $notification->formatted_created_at = $notification->formatted_created_at;
                $notification->is_read = $notification->is_read;
                $notification->is_archived = $notification->is_archived;
                return $notification;
            });

            return response()->json([
                'success' => true,
                'data' => $notifications->items(),
                'pagination' => [
                    'current_page' => $notifications->currentPage(),
                    'last_page' => $notifications->lastPage(),
                    'per_page' => $notifications->perPage(),
                    'total' => $notifications->total(),
                    'from' => $notifications->firstItem(),
                    'to' => $notifications->lastItem()
                ],
                'summary' => [
                    'total_notifications' => Notification::count(),
                    'unread_count' => Notification::unread()->count(),
                    'today_count' => Notification::whereDate('created_at', today())->count(),
                    'urgent_count' => Notification::byPriority('urgent')->unread()->count()
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch notifications',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a specific notification
     */
    public function show($id): JsonResponse
    {
        try {
            $notification = Notification::with(['patient', 'doctor', 'appointment'])->findOrFail($id);
            
            // Add computed properties
            $notification->time_ago = $notification->time_ago;
            $notification->formatted_created_at = $notification->formatted_created_at;
            $notification->is_read = $notification->is_read;
            $notification->is_archived = $notification->is_archived;

            return response()->json([
                'success' => true,
                'data' => $notification
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Notification not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Mark notification as read
     */
    public function markAsRead($id): JsonResponse
    {
        try {
            $notification = Notification::findOrFail($id);
            $notification->markAsRead();

            return response()->json([
                'success' => true,
                'message' => 'Notification marked as read',
                'data' => $notification->fresh()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark notification as read',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark notification as unread
     */
    public function markAsUnread($id): JsonResponse
    {
        try {
            $notification = Notification::findOrFail($id);
            $notification->markAsUnread();

            return response()->json([
                'success' => true,
                'message' => 'Notification marked as unread',
                'data' => $notification->fresh()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark notification as unread',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Archive notification
     */
    public function archive($id): JsonResponse
    {
        try {
            $notification = Notification::findOrFail($id);
            $notification->archive();

            return response()->json([
                'success' => true,
                'message' => 'Notification archived',
                'data' => $notification->fresh()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to archive notification',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Unarchive notification
     */
    public function unarchive($id): JsonResponse
    {
        try {
            $notification = Notification::findOrFail($id);
            $notification->unarchive();

            return response()->json([
                'success' => true,
                'message' => 'Notification unarchived',
                'data' => $notification->fresh()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to unarchive notification',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        try {
            $query = Notification::unread();
            
            if ($request->has('user_id')) {
                $query->forUser($request->user_id);
            }

            $updatedCount = $query->update([
                'status' => 'read',
                'read_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => "Marked {$updatedCount} notifications as read",
                'data' => ['updated_count' => $updatedCount]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark all notifications as read',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete notification
     */
    public function destroy($id): JsonResponse
    {
        try {
            $notification = Notification::findOrFail($id);
            $notification->delete();

            return response()->json([
                'success' => true,
                'message' => 'Notification deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete notification',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk delete notifications
     */
    public function bulkDelete(Request $request): JsonResponse
    {
        $request->validate([
            'notification_ids' => 'required|array',
            'notification_ids.*' => 'exists:notifications,id'
        ]);

        try {
            $deletedCount = Notification::whereIn('id', $request->notification_ids)->delete();

            return response()->json([
                'success' => true,
                'message' => "Deleted {$deletedCount} notifications",
                'data' => ['deleted_count' => $deletedCount]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete notifications',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get notification statistics
     */
    public function stats(): JsonResponse
    {
        try {
            $stats = [
                'total' => Notification::count(),
                'unread' => Notification::unread()->count(),
                'read' => Notification::read()->count(),
                'archived' => Notification::archived()->count(),
                'today' => Notification::whereDate('created_at', today())->count(),
                'this_week' => Notification::whereBetween('created_at', [
                    now()->startOfWeek(),
                    now()->endOfWeek()
                ])->count(),
                'priority_stats' => [
                    'urgent' => Notification::byPriority('urgent')->count(),
                    'high' => Notification::byPriority('high')->count(),
                    'medium' => Notification::byPriority('medium')->count(),
                    'low' => Notification::byPriority('low')->count()
                ],
                'type_stats' => Notification::select('type', \DB::raw('count(*) as count'))
                    ->groupBy('type')
                    ->pluck('count', 'type')
                    ->toArray()
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch notification statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a manual notification (for testing or admin use)
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'type' => 'required|string|max:255',
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'priority' => ['required', Rule::in(['low', 'medium', 'high', 'urgent'])],
            'user_id' => 'nullable|exists:users,id',
            'patient_id' => 'nullable|exists:patients,id',
            'doctor_id' => 'nullable|exists:doctors,id',
            'appointment_id' => 'nullable|exists:appointments,id',
            'data' => 'nullable|array'
        ]);

        try {
            $notification = Notification::create($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Notification created successfully',
                'data' => $notification->load(['patient', 'doctor', 'appointment'])
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create notification',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}