<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'email_notifications')) {
                // Customers can switch booking-update emails off in Settings.
                $table->boolean('email_notifications')->default(true);
            }
            if (! Schema::hasColumn('users', 'deactivated_at')) {
                // Set when someone deactivates their account. Rows are kept
                // (bookings/reviews/earnings history stay intact); the
                // account just can no longer log in.
                $table->timestamp('deactivated_at')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'email_notifications')) {
                $table->dropColumn('email_notifications');
            }
            if (Schema::hasColumn('users', 'deactivated_at')) {
                $table->dropColumn('deactivated_at');
            }
        });
    }
};
