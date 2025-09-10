<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Doctor extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'specialty',
        'education',
        'experience',
        'fee',
        'location',
        'status',
        'rating',
        'total_patients',
        'total_reviews',
        'about',
        'languages',
        'working_hours'
    ];

    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }

    protected $casts = [
        'experience' => 'integer',
        'fee' => 'decimal:2',
        'rating' => 'decimal:2',
        'total_patients' => 'integer',
        'total_reviews' => 'integer',
        'languages' => 'array',
        'working_hours' => 'array'
    ];
}
