<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Adds the missing `phone` column to the users table.
 *
 * AdminTechnicianController@index and @show select('phone') when
 * listing/showing providers, but no prior migration ever created this
 * column — causing:
 *   SQLSTATE[42S22]: Column not found: 1054 Unknown column 'phone' in 'field list'
 *
 * This migration brings the schema in line with what the controller expects.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('email');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('phone');
        });
    }
};