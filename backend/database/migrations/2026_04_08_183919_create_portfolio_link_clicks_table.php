<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('portfolio_link_clicks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('portfolio_id')->constrained()->cascadeOnDelete();
            $table->string('link_type', 30);
            $table->timestamp('clicked_at')->useCurrent();
        });
        if (config('database.default') !== 'sqlite') {
            DB::statement("ALTER TABLE portfolio_link_clicks ADD CONSTRAINT link_type_values CHECK (link_type IN ('email','tiktok','instagram','youtube','linkedin','other'))");
        }
    }
    public function down(): void
    {
        Schema::dropIfExists('portfolio_link_clicks');
    }
};
