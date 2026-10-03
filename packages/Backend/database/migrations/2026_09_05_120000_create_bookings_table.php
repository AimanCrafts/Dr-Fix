<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * bookings table
 * --------------
 * The real thing behind checkout.jsx's "Confirm Booking" button, which
 * previously just faked a booking ID client-side and never hit the
 * backend at all.
 *
 * technician_id starts NULL — a booking is created as "pending" with no
 * technician attached. Any approved technician whose service_category
 * matches can see it in their incoming-jobs list; whoever accepts it
 * FIRST gets technician_id set (see TechnicianBookingController::accept,
 * which does this as an atomic conditional UPDATE — the DB itself
 * decides the race, not application code).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();

            $table->foreignId('customer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('technician_id')->nullable()->constrained('users')->nullOnDelete();

            // Matched against the technician's own service_category
            // (users table) to decide who gets shown this job.
            $table->string('service_category');
            $table->string('service_name');
            $table->unsignedInteger('price');

            $table->string('address');
            $table->string('date_label');   // "Today" / "Tomorrow" / a picked date string
            $table->string('time_slot');
            $table->text('instructions')->nullable();

            // Stored only — no payment gateway integration (out of scope).
            $table->string('payment_method');

            $table->enum('status', ['pending', 'accepted', 'completed', 'cancelled'])
                ->default('pending');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
