<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'title',
        'message',
        'data',
        'priority',
        'status',
        'user_id',
        'patient_id',
        'doctor_id',
        'appointment_id',
        'read_at',
        'archived_at'
    ];

    protected $casts = [
        'data' => 'array',
        'read_at' => 'datetime',
        'archived_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    // Scopes
    public function scopeUnread($query)
    {
        return $query->where('status', 'unread');
    }

    public function scopeRead($query)
    {
        return $query->where('status', 'read');
    }

    public function scopeArchived($query)
    {
        return $query->where('status', 'archived');
    }

    public function scopeByPriority($query, $priority)
    {
        return $query->where('priority', $priority);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeRecent($query, $days = 7)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    // Accessors
    public function getIsReadAttribute(): bool
    {
        return $this->status === 'read';
    }

    public function getIsArchivedAttribute(): bool
    {
        return $this->status === 'archived';
    }

    public function getFormattedCreatedAtAttribute(): string
    {
        return $this->created_at->format('M d, Y \a\t g:i A');
    }

    public function getTimeAgoAttribute(): string
    {
        return $this->created_at->diffForHumans();
    }

    // Methods
    public function markAsRead(): void
    {
        $this->update([
            'status' => 'read',
            'read_at' => now()
        ]);
    }

    public function markAsUnread(): void
    {
        $this->update([
            'status' => 'unread',
            'read_at' => null
        ]);
    }

    public function archive(): void
    {
        $this->update([
            'status' => 'archived',
            'archived_at' => now()
        ]);
    }

    public function unarchive(): void
    {
        $this->update([
            'status' => 'unread',
            'archived_at' => null
        ]);
    }

    // Static methods for creating notifications
    public static function createAppointmentNotification($type, $appointment, $customMessage = null): self
    {
        // Handle cases where patient relationship might not exist
        $patientName = $appointment->patient ? $appointment->patient->name : $appointment->patient_name;
        $doctorName = $appointment->doctor ? $appointment->doctor->name : 'Unknown Doctor';
        
        $messages = [
            'appointment_created' => "New appointment scheduled with Dr. {$doctorName} for {$patientName}",
            'appointment_updated' => "Appointment with Dr. {$doctorName} has been updated for {$patientName}",
            'appointment_cancelled' => "Appointment with Dr. {$doctorName} has been cancelled for {$patientName}",
            'appointment_confirmed' => "Appointment with Dr. {$doctorName} has been confirmed for {$patientName}",
            'appointment_completed' => "Appointment with Dr. {$doctorName} has been completed for {$patientName}",
        ];

        $titles = [
            'appointment_created' => 'New Appointment Scheduled',
            'appointment_updated' => 'Appointment Updated',
            'appointment_cancelled' => 'Appointment Cancelled',
            'appointment_confirmed' => 'Appointment Confirmed',
            'appointment_completed' => 'Appointment Completed',
        ];

        $priorities = [
            'appointment_created' => 'medium',
            'appointment_updated' => 'medium',
            'appointment_cancelled' => 'high',
            'appointment_confirmed' => 'low',
            'appointment_completed' => 'low',
        ];

        return self::create([
            'type' => $type,
            'title' => $titles[$type] ?? 'Appointment Notification',
            'message' => $customMessage ?? $messages[$type] ?? 'Appointment notification',
            'priority' => $priorities[$type] ?? 'medium',
            'patient_id' => $appointment->patient_id,
            'doctor_id' => $appointment->doctor_id,
            'appointment_id' => $appointment->id,
            'data' => [
                'appointment_date' => $appointment->appointment_date,
                'appointment_time' => $appointment->appointment_time,
                'patient_name' => $patientName,
                'doctor_name' => $doctorName,
                'reason' => $appointment->reason
            ]
        ]);
    }

    public static function createPatientNotification($type, $patient, $customMessage = null): self
    {
        $messages = [
            'patient_registered' => "New patient {$patient->name} has been registered",
            'patient_updated' => "Patient {$patient->name} information has been updated",
        ];

        $titles = [
            'patient_registered' => 'New Patient Registered',
            'patient_updated' => 'Patient Information Updated',
        ];

        return self::create([
            'type' => $type,
            'title' => $titles[$type] ?? 'Patient Notification',
            'message' => $customMessage ?? $messages[$type] ?? 'Patient notification',
            'priority' => 'low',
            'patient_id' => $patient->id,
            'data' => [
                'patient_name' => $patient->name,
                'patient_phone' => $patient->phone,
                'patient_email' => $patient->email
            ]
        ]);
    }
}