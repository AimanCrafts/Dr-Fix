<?php

namespace App\Services;

use App\Models\Booking;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

/**
 * BookingExpiry
 * -------------
 * A pending booking nobody accepted must not stay "pending" forever.
 * Once its time window has ended it is cancelled and the customer is told.
 *
 * No cron job is needed: the sweep runs (cheaply) whenever a customer loads
 * their bookings or a technician loads the available-jobs list, so stale
 * requests disappear the next time anyone looks.
 */
class BookingExpiry
{
    /** End hour (Bangladesh time) of each booking window. */
    private const SLOT_END = [
        '8-11 AM'    => 11,
        '11 AM-2 PM' => 14,
        '2-5 PM'     => 17,
        '5-8 PM'     => 20,
    ];

    public static function sweep(): void
    {
        try {
            $now = Carbon::now('Asia/Dhaka');

            $candidates = Booking::where('status', 'pending')
                ->whereNotNull('scheduled_date')
                ->whereDate('scheduled_date', '<=', $now->toDateString())
                ->limit(200)
                ->get(['id', 'customer_id', 'service_name', 'scheduled_date', 'time_slot']);

            foreach ($candidates as $booking) {
                $endHour = self::SLOT_END[$booking->time_slot] ?? 23;

                $end = Carbon::createFromFormat(
                    'Y-m-d',
                    $booking->scheduled_date->format('Y-m-d'),
                    'Asia/Dhaka'
                )->setTime($endHour, 0, 0);

                if ($now->lte($end)) {
                    continue;
                }

                $updated = Booking::where('id', $booking->id)
                    ->where('status', 'pending')
                    ->update(['status' => 'cancelled', 'updated_at' => now()]);

                if ($updated) {
                    NotificationService::push(
                        $booking->customer_id,
                        'booking_expired',
                        'No technician available',
                        "No technician accepted your {$booking->service_name} booking in time, so it was cancelled. You can book again anytime.",
                        '/services'
                    );
                }
            }
        } catch (\Throwable $e) {
            Log::warning('Booking expiry sweep failed: ' . $e->getMessage());
        }
    }
}
