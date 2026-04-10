<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('portfolio_analytics', function (Blueprint $table) {
            // Hash stable (sans microtime) = même visiteur = même valeur
            $table->string('visitor_hash', 64)->nullable()->after('session_hash');
            $table->index('visitor_hash');
        });
    }

    public function down(): void
    {
        Schema::table('portfolio_analytics', function (Blueprint $table) {
            $table->dropIndex(['visitor_hash']);
            $table->dropColumn('visitor_hash');
        });
    }
};
