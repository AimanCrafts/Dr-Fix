<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

/**
 * Expands booking status beyond pending/accepted/completed/cancelled so
 * the customer's "Track Service" view can show real progress instead of
 * jumping straight from "technician assigned" to "done":
 *
 *   pending -> accepted -> on_the_way -> arrived -> in_progress -> completed
 *
 * Each stage also gets its own nullable timestamp so the exact time of
 * each transition is recorded (useful for the track-service timeline
 * and for any future "average response time" style reporting).
 */
return new class extends Migration
{
    public function up(): void
    {
        // MySQL enums require a full redefinition to add new values.
        DB::statement("ALTER TABLE bookings MODIFY status ENUM(
            'pending', 'accepted', 'on_the_way', 'arrived', 'in_progress', 'completed', 'cancelled'
        ) NOT NULL DEFAULT 'pending'");

        Schema::table('bookings', function (Blueprint $table) {
            $table->timestamp('accepted_at')->nullable()->after('status');
            $table->timestamp('on_the_way_at')->nullable()->after('accepted_at');
            $table->timestamp('arrived_at')->nullable()->after('on_the_way_at');
            $table->timestamp('started_at')->nullable()->after('arrived_at');
            $table->timestamp('completed_at')->nullable()->after('started_at');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn([
                'accepted_at', 'on_the_way_at', 'arrived_at', 'started_at', 'completed_at',
            ]);
        });

        DB::statement("ALTER TABLE bookings MODIFY status ENUM(
            'pending', 'accepted', 'completed', 'cancelled'
        ) NOT NULL DEFAULT 'pending'");
    }
};
