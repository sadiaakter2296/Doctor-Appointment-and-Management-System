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
        Schema::table('patients', function (Blueprint $table) {
            // Only add the missing booking-related fields
            $table->unsignedBigInteger('doctor_id')->nullable()->after('insurance_policy_number');
            $table->text('booking_reason')->nullable()->after('doctor_id');
            $table->datetime('preferred_appointment_date')->nullable()->after('booking_reason');
            $table->enum('appointment_status', ['Pending', 'Confirmed', 'Completed', 'Cancelled'])->default('Pending')->after('preferred_appointment_date');
            
            // Add foreign key constraint
            $table->foreign('doctor_id')->references('id')->on('doctors')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->dropForeign(['doctor_id']);
            $table->dropColumn(['doctor_id', 'booking_reason', 'preferred_appointment_date', 'appointment_status']);
        });
    }
};
