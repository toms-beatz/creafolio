<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // portfolio_analytics: add page_path + country_code
        Schema::table('portfolio_analytics', function (Blueprint $table) {
            if (!Schema::hasColumn('portfolio_analytics', 'page_path')) {
                $table->string('page_path', 200)->nullable()->after('referrer');
            }
            if (!Schema::hasColumn('portfolio_analytics', 'country_code')) {
                $table->char('country_code', 2)->nullable()->after('page_path');
            }
        });

        // portfolio_link_clicks: add link_label + fix link_type constraint
        Schema::table('portfolio_link_clicks', function (Blueprint $table) {
            if (!Schema::hasColumn('portfolio_link_clicks', 'link_label')) {
                $table->string('link_label', 100)->nullable()->after('link_type');
            }
        });

        if (config('database.default') !== 'sqlite') {
            // Drop old restrictive constraint and recreate with all accepted types
            DB::statement("ALTER TABLE portfolio_link_clicks DROP CONSTRAINT IF EXISTS link_type_values");
            DB::statement(
                "ALTER TABLE portfolio_link_clicks ADD CONSTRAINT link_type_values " .
                    "CHECK (link_type IN ('email','tiktok','instagram','youtube','linkedin','twitter','website','phone','other'))"
            );
        }
    }

    public function down(): void
    {
        Schema::table('portfolio_analytics', function (Blueprint $table) {
            $table->dropColumn(['page_path', 'country_code']);
        });

        Schema::table('portfolio_link_clicks', function (Blueprint $table) {
            $table->dropColumn('link_label');
        });
    }
};
