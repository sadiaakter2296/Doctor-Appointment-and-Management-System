<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('patients', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone');
            $table->date('date_of_birth');
            $table->enum('gender', ['Male', 'Female', 'Other']);
            $table->string('blood_type')->nullable();
            $table->text('address');
            $table->string('emergency_contact');
            $table->string('emergency_contact_name')->nullable();
            $table->enum('status', ['Active', 'Inactive'])->default('Active');
            $table->text('medical_history')->nullable();
            $table->text('allergies')->nullable();
            $table->string('insurance_provider')->nullable();
            $table->string('insurance_policy_number')->nullable();
            $table->unsignedBigInteger('doctor_id')->nullable();
            $table->text('booking_reason')->nullable();
            $table->datetime('preferred_appointment_date')->nullable();
            $table->enum('appointment_status', ['Pending', 'Confirmed', 'Completed', 'Cancelled'])->default('Pending');
            $table->timestamps();
            
            $table->foreign('doctor_id')->references('id')->on('doctors')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patients');
    }
};
