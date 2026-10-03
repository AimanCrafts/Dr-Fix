<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * addresses table
 * ----------------
 * Backs the "Saved Addresses" section on the customer dashboard and the
 * address picker on checkout.jsx — both previously used a hardcoded
 * MOCK_ADDRESSES array on the frontend.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('label');   // "Home", "Office", etc.
            $table->string('detail');  // full address text
            $table->boolean('is_default')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('addresses');
    }
};
