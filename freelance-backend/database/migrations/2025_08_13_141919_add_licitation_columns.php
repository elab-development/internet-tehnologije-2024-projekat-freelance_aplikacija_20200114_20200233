<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('requests', function (Blueprint $table) {
            $table->decimal('price_offer', 12, 2)->after('message');
            $table->timestamp('decided_at')->nullable()->after('status');
            $table->index(['project_id', 'status']);
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->boolean('is_locked')->default(false)->after('priority');
            $table->timestamp('locked_at')->nullable()->after('is_locked');
        });
    }

    public function down(): void
    {
        Schema::table('requests', function (Blueprint $table) {
            $table->dropIndex(['project_id', 'status']);
            $table->dropColumn(['price_offer', 'decided_at']);
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn(['is_locked', 'locked_at']);
        });
    }
};
