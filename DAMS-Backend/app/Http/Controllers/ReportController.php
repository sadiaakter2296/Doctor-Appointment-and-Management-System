<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\Appointment;
use App\Models\Billing;
use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class ReportController extends Controller
{
    /**
     * Get patients who have billing records
     */
    public function getPatientsWithBilling(): JsonResponse
    {
        try {
            // Get all unique patient IDs from billing records
            $billingPatientIds = Billing::distinct()->pluck('patient_id');
            
            $patients = collect();
            
            foreach ($billingPatientIds as $patientId) {
                // Get billing records for this patient
                $billings = Billing::where('patient_id', $patientId)->get();
                
                // Try to get the patient record
                $patient = Patient::find($patientId);
                
                if ($patient) {
                    // Patient exists, use patient data
                    $patients->push([
                        'id' => $patient->id,
                        'name' => $patient->name,
                        'email' => $patient->email,
                        'phone' => $patient->phone,
                        'age' => $patient->age,
                        'gender' => $patient->gender,
                        'total_billings' => $billings->count(),
                        'total_amount' => $billings->sum('total_amount'),
                        'last_visit' => $billings->sortByDesc('created_at')->first()?->created_at?->format('Y-m-d')
                    ]);
                } else {
                    // Patient doesn't exist, use billing data
                    $firstBilling = $billings->first();
                    $patients->push([
                        'id' => $patientId,
                        'name' => $firstBilling->patient_name ?? 'Unknown Patient',
                        'email' => $firstBilling->patient_email ?? 'N/A',
                        'phone' => $firstBilling->patient_phone ?? 'N/A',
                        'age' => null,
                        'gender' => 'N/A',
                        'total_billings' => $billings->count(),
                        'total_amount' => $billings->sum('total_amount'),
                        'last_visit' => $billings->sortByDesc('created_at')->first()?->created_at?->format('Y-m-d')
                    ]);
                }
            }

            return response()->json([
                'success' => true,
                'data' => $patients->values()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch patients with billing records',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate patient report
     */
    public function generateReport(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'patient_id' => 'required|integer',
                'report_type' => 'required|in:comprehensive,appointment,medication,financial',
                'date_from' => 'nullable|date',
                'date_to' => 'nullable|date|after_or_equal:date_from'
            ]);

            // Check if patient exists in patients table
            $patient = Patient::find($request->patient_id);
            
            // If patient doesn't exist, check if they have billing records
            if (!$patient) {
                $billingRecord = Billing::where('patient_id', $request->patient_id)->first();
                if (!$billingRecord) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Patient not found and has no billing records'
                    ], 404);
                }
                
                // Create a virtual patient object from billing data
                $patient = (object) [
                    'id' => $request->patient_id,
                    'name' => $billingRecord->patient_name ?? 'Unknown Patient',
                    'email' => $billingRecord->patient_email ?? 'N/A',
                    'phone' => $billingRecord->patient_phone ?? 'N/A',
                    'age' => null,
                    'gender' => 'N/A',
                    'date_of_birth' => null,
                    'address' => $billingRecord->patient_address ?? 'N/A'
                ];
            }
            
            $dateFrom = $request->date_from ? Carbon::parse($request->date_from) : null;
            $dateTo = $request->date_to ? Carbon::parse($request->date_to) : null;

            // Get appointments (only if patient exists in patients table)
            $appointments = collect();
            if ($patient instanceof Patient) {
                $appointments = $patient->appointments()
                    ->with('doctor')
                    ->when($dateFrom, function($query, $dateFrom) {
                        return $query->where('appointment_date', '>=', $dateFrom);
                    })
                    ->when($dateTo, function($query, $dateTo) {
                        return $query->where('appointment_date', '<=', $dateTo);
                    })
                    ->orderBy('appointment_date', 'desc')
                    ->get();
            }

            // Get billings
            $billings = Billing::where('patient_id', $request->patient_id)
                ->when($dateFrom, function($query, $dateFrom) {
                    return $query->where('created_at', '>=', $dateFrom);
                })
                ->when($dateTo, function($query, $dateTo) {
                    return $query->where('created_at', '<=', $dateTo);
                })
                ->orderBy('created_at', 'desc')
                ->get();

            // Generate report data based on type
            $reportData = $this->generateReportData($patient, $appointments, $billings, $request->report_type);

            // Save report to database (only if patient exists in patients table)
            $report = null;
            if ($patient instanceof Patient) {
                $report = Report::create([
                    'patient_id' => $patient->id,
                    'report_type' => $request->report_type,
                    'report_data' => $reportData,
                    'date_from' => $dateFrom,
                    'date_to' => $dateTo,
                    'generated_by' => 'Admin',
                    'generated_at' => now()
                ]);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'report_id' => $report ? $report->id : null,
                    'patient' => [
                        'id' => $patient->id,
                        'name' => $patient->name,
                        'email' => $patient->email,
                        'phone' => $patient->phone,
                        'age' => $patient->age ?? null,
                        'gender' => $patient->gender ?? 'N/A'
                    ],
                    'report_type' => $request->report_type,
                    'report_data' => $reportData,
                    'generated_at' => $report ? $report->generated_at->toISOString() : now()->toISOString()
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate report',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get recent reports
     */
    public function getRecentReports(): JsonResponse
    {
        try {
            $reports = Report::with('patient')
                ->latest('generated_at')
                ->limit(10)
                ->get()
                ->map(function($report) {
                    return [
                        'id' => $report->id,
                        'patient_name' => $report->patient->name,
                        'report_type' => $report->report_type,
                        'generated_at' => $report->generated_at->format('Y-m-d'),
                        'generated_by' => $report->generated_by
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $reports
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch recent reports',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate report data based on type
     */
    private function generateReportData($patient, $appointments, $billings, $reportType): array
    {
        $baseData = [
            'patient' => [
                'name' => $patient->name,
                'email' => $patient->email,
                'phone' => $patient->phone,
                'age' => $patient->age,
                'gender' => $patient->gender
            ]
        ];

        switch ($reportType) {
            case 'comprehensive':
                return array_merge($baseData, [
                    'appointments' => $appointments->map(function($apt) {
                        return [
                            'date' => $apt->appointment_date,
                            'time' => $apt->appointment_time,
                            'doctor' => $apt->doctor->name ?? 'N/A',
                            'status' => $apt->status,
                            'notes' => $apt->notes ?? 'No notes'
                        ];
                    }),
                    'billings' => $billings->map(function($bill) {
                        return [
                            'date' => $bill->created_at->format('Y-m-d'),
                            'amount' => $bill->total_amount,
                            'status' => $bill->payment_status,
                            'services' => $bill->services ?? 'General consultation'
                        ];
                    }),
                    'summary' => [
                        'total_visits' => $appointments->count(),
                        'total_amount' => $billings->sum('total_amount'),
                        'last_visit' => $appointments->first()?->appointment_date,
                        'avg_visit_cost' => $billings->avg('total_amount')
                    ]
                ]);

            case 'appointment':
                return array_merge($baseData, [
                    'appointments' => $appointments->map(function($apt) {
                        return [
                            'date' => $apt->appointment_date,
                            'time' => $apt->appointment_time,
                            'doctor' => $apt->doctor->name ?? 'N/A',
                            'status' => $apt->status,
                            'notes' => $apt->notes ?? 'No notes'
                        ];
                    }),
                    'summary' => [
                        'total_appointments' => $appointments->count(),
                        'completed' => $appointments->where('status', 'completed')->count(),
                        'cancelled' => $appointments->where('status', 'cancelled')->count()
                    ]
                ]);

            case 'financial':
                return array_merge($baseData, [
                    'billings' => $billings->map(function($bill) {
                        return [
                            'date' => $bill->created_at->format('Y-m-d'),
                            'amount' => $bill->total_amount,
                            'status' => $bill->payment_status,
                            'payment_method' => $bill->payment_method ?? 'Cash',
                            'services' => $bill->services ?? 'General consultation'
                        ];
                    }),
                    'summary' => [
                        'total_amount' => $billings->sum('total_amount'),
                        'paid_amount' => $billings->where('payment_status', 'paid')->sum('total_amount'),
                        'pending_amount' => $billings->where('payment_status', 'pending')->sum('total_amount'),
                        'average_bill' => $billings->avg('total_amount')
                    ]
                ]);

            case 'medication':
                // For now, return appointment-based medication info
                return array_merge($baseData, [
                    'medications' => $appointments->map(function($apt) {
                        return [
                            'date' => $apt->appointment_date,
                            'doctor' => $apt->doctor->name ?? 'N/A',
                            'prescription' => $apt->notes ?? 'No prescription notes',
                            'status' => $apt->status
                        ];
                    }),
                    'summary' => [
                        'total_prescriptions' => $appointments->count(),
                        'recent_prescription' => $appointments->first()?->notes ?? 'No recent prescription'
                    ]
                ]);

            default:
                return $baseData;
        }
    }
}