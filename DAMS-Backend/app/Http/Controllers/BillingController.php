<?php

namespace App\Http\Controllers;

use App\Models\Billing;
use App\Models\Patient;
use App\Models\Doctor;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Exception;

class BillingController extends Controller
{
    /**
     * Display a listing of billings.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Billing::with(['patient', 'doctor', 'appointment']);

            // Apply filters
            if ($request->has('status') && $request->status !== '') {
                $query->byStatus($request->status);
            }

            if ($request->has('payment_status') && $request->payment_status !== '') {
                $query->byPaymentStatus($request->payment_status);
            }

            if ($request->has('patient_id')) {
                $query->where('patient_id', $request->patient_id);
            }

            if ($request->has('doctor_id')) {
                $query->where('doctor_id', $request->doctor_id);
            }

            // Date range filter
            if ($request->has('date_from')) {
                $query->where('invoice_date', '>=', $request->date_from);
            }

            if ($request->has('date_to')) {
                $query->where('invoice_date', '<=', $request->date_to);
            }

            // Search
            if ($request->has('search') && $request->search !== '') {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('invoice_number', 'LIKE', "%{$search}%")
                      ->orWhere('patient_name', 'LIKE', "%{$search}%")
                      ->orWhere('patient_email', 'LIKE', "%{$search}%")
                      ->orWhere('doctor_name', 'LIKE', "%{$search}%");
                });
            }

            // Sorting
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Pagination
            $perPage = $request->get('per_page', 15);
            $billings = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $billings,
                'message' => 'Billings retrieved successfully'
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve billings: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created billing.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'patient_id' => 'required|exists:patients,id',
                'appointment_id' => 'nullable|exists:appointments,id',
                'doctor_id' => 'nullable|exists:doctors,id',
                'patient_name' => 'required|string|max:255',
                'patient_email' => 'nullable|email|max:255',
                'patient_phone' => 'nullable|string|max:20',
                'patient_address' => 'nullable|string',
                'doctor_name' => 'nullable|string|max:255',
                'invoice_date' => 'required|date',
                'due_date' => 'required|date|after_or_equal:invoice_date',
                'items' => 'required|array|min:1',
                'items.*.service' => 'required|string|max:255',
                'items.*.description' => 'nullable|string',
                'items.*.quantity' => 'required|numeric|min:1',
                'items.*.rate' => 'required|numeric|min:0',
                'subtotal' => 'required|numeric|min:0',
                'tax_amount' => 'nullable|numeric|min:0',
                'discount_amount' => 'nullable|numeric|min:0',
                'total_amount' => 'required|numeric|min:0',
                'status' => 'nullable|in:draft,sent,paid,overdue,cancelled',
                'payment_status' => 'nullable|in:pending,partial,paid,refunded',
                'notes' => 'nullable|string',
                'payment_terms' => 'nullable|string|max:255'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            // Calculate amounts for items
            $items = collect($request->items)->map(function ($item) {
                $amount = ($item['quantity'] ?? 1) * ($item['rate'] ?? 0);
                return array_merge($item, ['amount' => $amount]);
            });

            $billing = Billing::create([
                'patient_id' => $request->patient_id,
                'appointment_id' => $request->appointment_id,
                'doctor_id' => $request->doctor_id,
                'patient_name' => $request->patient_name,
                'patient_email' => $request->patient_email,
                'patient_phone' => $request->patient_phone,
                'patient_address' => $request->patient_address,
                'doctor_name' => $request->doctor_name,
                'invoice_date' => $request->invoice_date,
                'due_date' => $request->due_date,
                'items' => $items->toArray(),
                'subtotal' => $request->subtotal,
                'tax_amount' => $request->tax_amount ?? 0,
                'discount_amount' => $request->discount_amount ?? 0,
                'total_amount' => $request->total_amount,
                'status' => $request->status ?? 'draft',
                'payment_status' => $request->payment_status ?? 'pending',
                'notes' => $request->notes,
                'payment_terms' => $request->payment_terms ?? '30 days'
            ]);

            DB::commit();

            $billing->load(['patient', 'doctor', 'appointment']);

            return response()->json([
                'success' => true,
                'data' => $billing,
                'message' => 'Billing created successfully'
            ], 201);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create billing: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified billing.
     */
    public function show($id): JsonResponse
    {
        try {
            $billing = Billing::with(['patient', 'doctor', 'appointment'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $billing,
                'message' => 'Billing retrieved successfully'
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Billing not found'
            ], 404);
        }
    }

    /**
     * Update the specified billing.
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $billing = Billing::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'patient_id' => 'sometimes|exists:patients,id',
                'appointment_id' => 'nullable|exists:appointments,id',
                'doctor_id' => 'nullable|exists:doctors,id',
                'patient_name' => 'sometimes|string|max:255',
                'patient_email' => 'nullable|email|max:255',
                'patient_phone' => 'nullable|string|max:20',
                'patient_address' => 'nullable|string',
                'doctor_name' => 'nullable|string|max:255',
                'invoice_date' => 'sometimes|date',
                'due_date' => 'sometimes|date|after_or_equal:invoice_date',
                'items' => 'sometimes|array|min:1',
                'items.*.service' => 'required_with:items|string|max:255',
                'items.*.description' => 'nullable|string',
                'items.*.quantity' => 'required_with:items|numeric|min:1',
                'items.*.rate' => 'required_with:items|numeric|min:0',
                'subtotal' => 'sometimes|numeric|min:0',
                'tax_amount' => 'nullable|numeric|min:0',
                'discount_amount' => 'nullable|numeric|min:0',
                'total_amount' => 'sometimes|numeric|min:0',
                'status' => 'nullable|in:draft,sent,paid,overdue,cancelled',
                'payment_status' => 'nullable|in:pending,partial,paid,refunded',
                'notes' => 'nullable|string',
                'payment_terms' => 'nullable|string|max:255'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            $updateData = $request->only([
                'patient_id', 'appointment_id', 'doctor_id', 'patient_name',
                'patient_email', 'patient_phone', 'patient_address', 'doctor_name',
                'invoice_date', 'due_date', 'subtotal', 'tax_amount',
                'discount_amount', 'total_amount', 'status', 'payment_status',
                'notes', 'payment_terms'
            ]);

            if ($request->has('items')) {
                $items = collect($request->items)->map(function ($item) {
                    $amount = ($item['quantity'] ?? 1) * ($item['rate'] ?? 0);
                    return array_merge($item, ['amount' => $amount]);
                });
                $updateData['items'] = $items->toArray();
            }

            $billing->update($updateData);

            DB::commit();

            $billing->load(['patient', 'doctor', 'appointment']);

            return response()->json([
                'success' => true,
                'data' => $billing,
                'message' => 'Billing updated successfully'
            ]);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update billing: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified billing.
     */
    public function destroy($id): JsonResponse
    {
        try {
            $billing = Billing::findOrFail($id);
            $billing->delete();

            return response()->json([
                'success' => true,
                'message' => 'Billing deleted successfully'
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete billing: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark billing as paid.
     */
    public function markAsPaid(Request $request, $id): JsonResponse
    {
        try {
            $billing = Billing::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'amount' => 'nullable|numeric|min:0',
                'paid_at' => 'nullable|date'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $billing->markAsPaid(
                $request->amount,
                $request->paid_at ? $request->paid_at : null
            );

            return response()->json([
                'success' => true,
                'data' => $billing->fresh(),
                'message' => 'Billing marked as paid successfully'
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark billing as paid: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add payment to billing.
     */
    public function addPayment(Request $request, $id): JsonResponse
    {
        try {
            $billing = Billing::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'amount' => 'required|numeric|min:0.01',
                'paid_at' => 'nullable|date'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $billing->addPayment(
                $request->amount,
                $request->paid_at ? $request->paid_at : null
            );

            return response()->json([
                'success' => true,
                'data' => $billing->fresh(),
                'message' => 'Payment added successfully'
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add payment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get billing statistics.
     */
    public function statistics(): JsonResponse
    {
        try {
            $stats = [
                'total_billings' => Billing::count(),
                'total_revenue' => Billing::sum('total_amount'),
                'paid_revenue' => Billing::paid()->sum('total_amount'),
                'pending_revenue' => Billing::pending()->sum('total_amount'),
                'overdue_billings' => Billing::overdue()->count(),
                'overdue_amount' => Billing::overdue()->sum('total_amount'),
                'monthly_revenue' => Billing::whereMonth('invoice_date', date('m'))
                    ->whereYear('invoice_date', date('Y'))
                    ->sum('total_amount'),
                'monthly_billings' => Billing::whereMonth('invoice_date', date('m'))
                    ->whereYear('invoice_date', date('Y'))
                    ->count()
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'Statistics retrieved successfully'
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve statistics: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get billing by appointment.
     */
    public function getByAppointment($appointmentId): JsonResponse
    {
        try {
            $billings = Billing::where('appointment_id', $appointmentId)
                ->with(['patient', 'doctor', 'appointment'])
                ->get();

            return response()->json([
                'success' => true,
                'data' => $billings,
                'message' => 'Appointment billings retrieved successfully'
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve appointment billings: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create billing from appointment data.
     */
    public function createFromAppointment(Request $request, $appointmentId): JsonResponse
    {
        try {
            $appointment = Appointment::with(['patient', 'doctor'])->findOrFail($appointmentId);

            // Check if billing already exists for this appointment
            $existingBilling = Billing::where('appointment_id', $appointmentId)->first();
            if ($existingBilling) {
                return response()->json([
                    'success' => false,
                    'message' => 'Billing already exists for this appointment',
                    'data' => $existingBilling
                ], 409);
            }

            // Validate request data
            $validator = Validator::make($request->all(), [
                'items' => 'required|array|min:1',
                'items.*.service' => 'required|string|max:255',
                'items.*.description' => 'nullable|string',
                'items.*.quantity' => 'required|numeric|min:1',
                'items.*.rate' => 'required|numeric|min:0',
                'payment_terms' => 'required|string|max:255',
                'due_date' => 'required|date|after_or_equal:today',
                'notes' => 'nullable|string',
                'tax_rate' => 'nullable|numeric|min:0|max:100',
                'discount_amount' => 'nullable|numeric|min:0'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            // Generate unique invoice number
            $invoiceNumber = $this->generateInvoiceNumber();

            // Calculate totals
            $subtotal = 0;
            $items = $request->items;
            
            foreach ($items as &$item) {
                $item['amount'] = $item['quantity'] * $item['rate'];
                $subtotal += $item['amount'];
            }

            $taxRate = $request->tax_rate ?? 0;
            $taxAmount = $subtotal * ($taxRate / 100);
            $discountAmount = $request->discount_amount ?? 0;
            $totalAmount = $subtotal + $taxAmount - $discountAmount;

            // Create billing record
            $billing = Billing::create([
                'invoice_number' => $invoiceNumber,
                'appointment_id' => $appointment->id,
                'patient_id' => $appointment->patient_id,
                'patient_name' => $appointment->patient_name,
                'patient_email' => $appointment->patient_email,
                'patient_phone' => $appointment->patient_phone,
                'doctor_id' => $appointment->doctor_id,
                'doctor_name' => $appointment->doctor->name ?? '',
                'invoice_date' => now(),
                'due_date' => $request->due_date,
                'payment_terms' => $request->payment_terms,
                'subtotal' => $subtotal,
                'tax_rate' => $taxRate,
                'tax_amount' => $taxAmount,
                'discount_amount' => $discountAmount,
                'total_amount' => $totalAmount,
                'items' => $items,
                'notes' => $request->notes,
                'status' => 'draft',
                'payment_status' => 'pending',
                'paid_amount' => 0
            ]);

            DB::commit();

            // Load the billing with relationships
            $billing->load(['patient', 'doctor', 'appointment']);

            return response()->json([
                'success' => true,
                'data' => $billing,
                'message' => 'Billing created successfully from appointment'
            ], 201);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create billing from appointment: ' . $e->getMessage()
            ], 500);
        }
    }
}