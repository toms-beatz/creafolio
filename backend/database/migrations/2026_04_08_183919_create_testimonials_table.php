<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('testimonials', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('content');
            $table->smallInteger('rating')->default(5);
            $table->string('status', 20)->default('pending');
            $table->string('display_name')->nullable();
            $table->string('display_role')->default('Créateur UGC');
            $table->text('admin_note')->nullable();
            $table->boolean('featured')->default(false);
            $table->timestamps();
        });
        if (config('database.default') !== 'sqlite') {
            DB::statement("ALTER TABLE testimonials ADD CONSTRAINT rating_range CHECK (rating >= 1 AND rating <= 5)");
            DB::statement("ALTER TABLE testimonials ADD CONSTRAINT status_values CHECK (status IN ('pending','approved','rejected'))");
        }
    }
    public function down(): void
    {
        Schema::dropIfExists('testimonials');
    }
};
