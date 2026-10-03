<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Adds role + provider-only fields to the existing users table.
 * Kept as one additive migration rather than touching the original
 * 2014_10_12_000000_create_users_table.php, so nothing already migrated
 * has to be re-run/dropped.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['customer', 'provider'])->default('customer')->after('email');

            // Provider-only fields — null/unused for role = 'customer'.
            $table->string('service_category')->nullable()->after('role');
            $table->unsignedSmallInteger('years_of_experience')->nullable()->after('service_category');
            $table->string('work_area')->nullable()->after('years_of_experience');
            $table->string('nid_path')->nullable()->after('work_area');

            // Admin approval workflow for providers (see earlier project
            // discussion: signup -> OTP verify -> "Under Review" -> admin
            // approves/rejects). Null for customers, 'pending' on provider
            // signup, then 'approved' / 'rejected' once an admin reviews.
            $table->enum('approval_status', ['pending', 'approved', 'rejected'])
                ->nullable()
                ->after('nid_path');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'role',
                'service_category',
                'years_of_experience',
                'work_area',
                'nid_path',
                'approval_status',
            ]);
        });
    }
};
