<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Patient extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'date_of_birth',
        'gender',
        'blood_type',
        'address',
        'emergency_contact',
        'emergency_contact_name',
        'status',
        'medical_history',
        'allergies',
        'insurance_provider',
        'insurance_policy_number',
        'doctor_id',
        'booking_reason',
        'preferred_appointment_date',
        'appointment_status'
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'preferred_appointment_date' => 'datetime',
    ];

    // Age accessor
    public function getAgeAttribute()
    {
        if (!$this->date_of_birth) {
            return null;
        }
        return $this->date_of_birth->age;
    }

    // Relationship with appointments
    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }

    // Relationship with doctor
    public function doctor()
    {
        return $this->belongsTo(Doctor::class);
    }

    // Relationship with billings
    public function billings()
    {
        return $this->hasMany(Billing::class);
    }
}
