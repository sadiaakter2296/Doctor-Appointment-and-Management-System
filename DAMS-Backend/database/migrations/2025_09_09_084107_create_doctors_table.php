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
        Schema::create('doctors', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone');
            $table->string('specialty');
            $table->text('education');
            $table->integer('experience');
            $table->decimal('fee', 8, 2);
            $table->string('location');
            $table->enum('status', ['Available', 'Busy', 'Offline'])->default('Available');
            $table->decimal('rating', 3, 2)->default(0.00);
            $table->integer('total_patients')->default(0);
            $table->integer('total_reviews')->default(0);
            $table->text('about')->nullable();
            $table->json('languages')->nullable();
            $table->json('working_hours')->nullable();
            $table->string('profile_image')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('doctors');
    }
};
