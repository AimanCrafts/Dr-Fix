<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->string('payment_status')->default('unpaid')->after('payment_method');
            $table->string('payment_provider')->nullable()->after('payment_status');
            $table->string('payment_transaction_id', 40)->nullable()->unique()->after('payment_provider');
            $table->string('payment_phone', 20)->nullable()->after('payment_transaction_id');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropUnique(['payment_transaction_id']);
            $table->dropColumn(['payment_status', 'payment_provider', 'payment_transaction_id', 'payment_phone']);
        });
    }
};
