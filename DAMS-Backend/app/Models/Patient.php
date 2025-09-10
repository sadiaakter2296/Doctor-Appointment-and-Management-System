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
        'insurance_policy_number'
    ];

    protected $casts = [
        'date_of_birth' => 'date',
    ];

    // Relationship with appointments
    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }
}
