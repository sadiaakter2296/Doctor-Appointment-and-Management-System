<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Billing extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_number',
        'patient_id',
        'appointment_id',
        'doctor_id',
        'patient_name',
        'patient_email',
        'patient_phone',
        'patient_address',
        'doctor_name',
        'invoice_date',
        'due_date',
        'items',
        'subtotal',
        'tax_amount',
        'discount_amount',
        'total_amount',
        'status',
        'payment_status',
        'notes',
        'payment_terms',
        'paid_at',
        'paid_amount'
    ];

    protected $casts = [
        'items' => 'array',
        'invoice_date' => 'date',
        'due_date' => 'date',
        'paid_at' => 'datetime',
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2'
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($billing) {
            if (empty($billing->invoice_number)) {
                $billing->invoice_number = static::generateInvoiceNumber();
            }
        });
    }

    public static function generateInvoiceNumber()
    {
        $year = date('Y');
        $month = date('m');
        $lastInvoice = static::whereRaw('YEAR(created_at) = ?', [$year])
            ->whereRaw('MONTH(created_at) = ?', [$month])
            ->orderBy('id', 'desc')
            ->first();
        
        $sequence = $lastInvoice ? 
            (int) substr($lastInvoice->invoice_number, -4) + 1 : 1;
        
        return sprintf('INV-%s%s-%04d', $year, $month, $sequence);
    }

    // Relationships
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }

    // Accessors & Mutators
    public function getFormattedTotalAttribute()
    {
        return '৳' . number_format($this->total_amount, 2);
    }

    public function getFormattedSubtotalAttribute()
    {
        return '৳' . number_format($this->subtotal, 2);
    }

    public function getFormattedTaxAttribute()
    {
        return '৳' . number_format($this->tax_amount, 2);
    }

    public function getFormattedDiscountAttribute()
    {
        return '৳' . number_format($this->discount_amount, 2);
    }

    public function getIsOverdueAttribute()
    {
        return $this->due_date < now() && $this->payment_status !== 'paid';
    }

    public function getDaysOverdueAttribute()
    {
        if (!$this->is_overdue) {
            return 0;
        }
        
        return now()->diffInDays($this->due_date);
    }

    public function getRemainingAmountAttribute()
    {
        return $this->total_amount - $this->paid_amount;
    }

    // Scopes
    public function scopePaid($query)
    {
        return $query->where('payment_status', 'paid');
    }

    public function scopePending($query)
    {
        return $query->where('payment_status', 'pending');
    }

    public function scopeOverdue($query)
    {
        return $query->where('due_date', '<', now())
            ->where('payment_status', '!=', 'paid');
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByPaymentStatus($query, $paymentStatus)
    {
        return $query->where('payment_status', $paymentStatus);
    }

    // Methods
    public function markAsPaid($amount = null, $paidAt = null)
    {
        $this->update([
            'payment_status' => 'paid',
            'paid_amount' => $amount ?? $this->total_amount,
            'paid_at' => $paidAt ?? now(),
            'status' => 'paid'
        ]);
    }

    public function addPayment($amount, $paidAt = null)
    {
        $newPaidAmount = $this->paid_amount + $amount;
        
        $paymentStatus = 'partial';
        if ($newPaidAmount >= $this->total_amount) {
            $paymentStatus = 'paid';
        }

        $this->update([
            'paid_amount' => $newPaidAmount,
            'payment_status' => $paymentStatus,
            'paid_at' => $paymentStatus === 'paid' ? ($paidAt ?? now()) : $this->paid_at
        ]);
    }

    public function calculateTotals()
    {
        $subtotal = collect($this->items)->sum(function ($item) {
            return ($item['quantity'] ?? 1) * ($item['rate'] ?? 0);
        });

        $this->subtotal = $subtotal;
        $this->total_amount = $subtotal + $this->tax_amount - $this->discount_amount;
        
        return $this;
    }
}