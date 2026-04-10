<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('app_config', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->json('value');
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
        });

        DB::table('app_config')->insert([
            ['key' => 'trial_duration_days', 'value' => '7'],
            ['key' => 'max_portfolios_free', 'value' => '1'],
            ['key' => 'max_portfolios_premium', 'value' => '5'],
            ['key' => 'max_blocks_free', 'value' => '6'],
            ['key' => 'maintenance_mode', 'value' => 'false'],
        ]);
    }
    public function down(): void
    {
        Schema::dropIfExists('app_config');
    }
};
