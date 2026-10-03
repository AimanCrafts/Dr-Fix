<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Bring bookings created under the old workflow into the new one
        // before removing the old enum values.
        DB::statement("UPDATE bookings SET status = 'accepted' WHERE status IN ('on_the_way', 'arrived')");

        // Preserve a useful accepted timestamp for legacy rows.
        DB::statement("UPDATE bookings SET accepted_at = COALESCE(accepted_at, updated_at) WHERE status = 'accepted'");

        // A legacy in-progress booking should remain in progress. If its
        // old started timestamp is missing, updated_at is the best available
        // historical point in time.
        DB::statement("UPDATE bookings SET started_at = COALESCE(started_at, updated_at) WHERE status = 'in_progress'");

        DB::statement("ALTER TABLE bookings MODIFY status ENUM(
            'pending', 'accepted', 'in_progress', 'completed', 'cancelled'
        ) NOT NULL DEFAULT 'pending'");

        Schema::table('bookings', function ($table) {
            $table->dropColumn(['on_the_way_at', 'arrived_at']);
        });
    }

    public function down(): void
    {
        // Restore the old enum values for rollback compatibility. Existing
        // accepted/in-progress records remain valid, but there is no reliable
        // way to reconstruct the exact old intermediate stage for them.
        DB::statement("ALTER TABLE bookings MODIFY status ENUM(
            'pending', 'accepted', 'on_the_way', 'arrived', 'in_progress', 'completed', 'cancelled'
        ) NOT NULL DEFAULT 'pending'");

        Schema::table('bookings', function ($table) {
            $table->timestamp('on_the_way_at')->nullable()->after('accepted_at');
            $table->timestamp('arrived_at')->nullable()->after('on_the_way_at');
        });
    }
};
