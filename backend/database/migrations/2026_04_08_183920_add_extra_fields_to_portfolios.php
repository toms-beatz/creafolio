<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('portfolios', function (Blueprint $table) {
            if (!Schema::hasColumn('portfolios', 'status')) {
                $table->string('status', 20)->default('draft')->after('slug');
            }
            if (!Schema::hasColumn('portfolios', 'craft_state')) {
                $table->json('craft_state')->nullable()->after('status');
            }
        });
        if (config('database.default') !== 'sqlite') {
            DB::statement(<<<'SQL'
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'status_values'
    ) THEN
        ALTER TABLE portfolios
        ADD CONSTRAINT status_values
        CHECK (status IN ('draft','published','suspended','deleted'));
    END IF;
END
$$;
SQL);
        }
    }
    public function down(): void {}
};
