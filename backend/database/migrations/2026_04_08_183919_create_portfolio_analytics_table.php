<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('portfolio_analytics', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('portfolio_id')->constrained()->cascadeOnDelete();
            $table->string('session_hash', 64);
            $table->string('referrer')->nullable();
            $table->boolean('is_bot')->default(false);
            $table->timestamp('viewed_at')->useCurrent();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('portfolio_analytics');
    }
};
