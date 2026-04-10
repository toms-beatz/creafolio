<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('portfolio_id')->constrained()->cascadeOnDelete();
            $table->string('motif', 30);
            $table->text('description')->nullable();
            $table->string('reporter_hash', 32)->nullable();
            $table->string('status', 20)->default('pending');
            $table->timestamp('created_at')->useCurrent();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
