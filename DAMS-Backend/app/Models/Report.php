<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Report extends Model
{
    protected $fillable = [
        'patient_id',
        'report_type',
        'report_data',
        'date_from',
        'date_to',
        'generated_by',
        'generated_at'
    ];

    protected $casts = [
        'report_data' => 'array',
        'date_from' => 'date',
        'date_to' => 'date',
        'generated_at' => 'datetime'
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function scopeByPatient($query, $patientId)
    {
        return $query->where('patient_id', $patientId);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('report_type', $type);
    }

    public function scopeByDateRange($query, $from, $to)
    {
        if ($from) {
            $query->where('date_from', '>=', $from);
        }
        if ($to) {
            $query->where('date_to', '<=', $to);
        }
        return $query;
    }
}