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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->string('type'); // 'appointment_created', 'appointment_updated', 'appointment_cancelled', etc.
            $table->string('title');
            $table->text('message');
            $table->json('data')->nullable(); // Additional data (appointment_id, patient_id, etc.)
            $table->string('priority')->default('medium'); // 'low', 'medium', 'high', 'urgent'
            $table->string('status')->default('unread'); // 'unread', 'read', 'archived'
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade'); // Who should see this notification
            $table->foreignId('patient_id')->nullable()->constrained()->onDelete('cascade'); // Related patient
            $table->foreignId('doctor_id')->nullable()->constrained()->onDelete('cascade'); // Related doctor
            $table->foreignId('appointment_id')->nullable()->constrained()->onDelete('cascade'); // Related appointment
            $table->timestamp('read_at')->nullable();
            $table->timestamp('archived_at')->nullable();
            $table->timestamps();
            
            // Indexes for better performance
            $table->index(['user_id', 'status']);
            $table->index(['type', 'created_at']);
            $table->index(['priority', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};