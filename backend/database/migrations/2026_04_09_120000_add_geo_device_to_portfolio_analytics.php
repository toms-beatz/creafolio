<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('portfolio_analytics', function (Blueprint $table) {
            if (!Schema::hasColumn('portfolio_analytics', 'city')) {
                $table->string('city', 100)->nullable()->after('country_code');
            }
            if (!Schema::hasColumn('portfolio_analytics', 'device_type')) {
                $table->string('device_type', 20)->nullable()->after('city');
            }
        });
    }

    public function down(): void
    {
        Schema::table('portfolio_analytics', function (Blueprint $table) {
            $table->dropColumnIfExists('city');
            $table->dropColumnIfExists('device_type');
        });
    }
};
