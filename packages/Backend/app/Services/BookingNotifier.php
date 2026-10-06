<?php

namespace App\Services;

use App\Mail\BookingStatusMail;
use App\Models\Booking;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * BookingNotifier
 * ---------------
 * Emails a customer when something important happens to their booking.
 *
 * - Only runs if the customer kept "Booking updates" switched on in Settings.
 * - Sending is deferred with app()->terminating(), i.e. it runs AFTER the
 *   HTTP response has gone back to the technician. A slow or failing mail
 *   server therefore never slows down or breaks accepting/completing a job.
 * - Any mail failure is only logged.
 */
class BookingNotifier
{
    public static function customer(int $bookingId, string $event): void
    {
        app()->terminating(function () use ($bookingId, $event) {
            try {
                $booking = Booking::with(['customer', 'technician'])->find($bookingId);

                if (! $booking || ! $booking->customer) {
                    return;
                }

                $customer = $booking->customer;

                if (! $customer->email || ! $customer->email_notifications || $customer->deactivated_at) {
                    return;
                }

                Mail::to($customer->email)->send(new BookingStatusMail($booking, $event));
            } catch (\Throwable $e) {
                Log::warning('Booking email failed: ' . $e->getMessage());
            }
        });
    }
}
