<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->onDelete('cascade');
            $table->string('report_type'); // comprehensive, appointment, medication, financial
            $table->json('report_data'); // Store generated report data
            $table->date('date_from')->nullable();
            $table->date('date_to')->nullable();
            $table->string('generated_by'); // admin name or user who generated
            $table->timestamp('generated_at');
            $table->timestamps();
            
            $table->index(['patient_id', 'report_type']);
            $table->index('generated_at');
        });
    }

    public function down()
    {
        Schema::dropIfExists('reports');
    }
};