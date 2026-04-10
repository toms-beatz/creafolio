<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('profiles', function (Blueprint $table) {
            $table->foreignId('id')->primary()->constrained('users')->cascadeOnDelete();
            $table->string('username', 30)->nullable()->unique();
            $table->string('email');
            $table->string('display_name', 100)->nullable();
            $table->text('bio')->nullable();
            $table->string('avatar_url')->nullable();
            $table->string('plan', 20)->default('free');
            $table->timestamp('trial_ends_at')->nullable();
            $table->string('stripe_customer_id')->nullable()->unique();
            $table->string('role', 20)->default('user');
            $table->boolean('onboarding_completed')->default(false);
            $table->softDeletes('deleted_at');
            $table->timestamps();
        });
        // PostgreSQL-only constraints (skipped on SQLite for local dev)
        if (config('database.default') !== 'sqlite') {
            DB::statement("ALTER TABLE profiles ADD CONSTRAINT username_format CHECK (username ~ '^[a-z0-9-]{3,30}$')");
            DB::statement("ALTER TABLE profiles ADD CONSTRAINT plan_values CHECK (plan IN ('free','trial','premium'))");
            DB::statement("ALTER TABLE profiles ADD CONSTRAINT role_values CHECK (role IN ('user','admin'))");
        }
    }
    public function down(): void
    {
        Schema::dropIfExists('profiles');
    }
};
