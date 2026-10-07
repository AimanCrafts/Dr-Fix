<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\PlatformSetting;

/**
 * CommissionService
 * -----------------
 * All platform-fee maths lives here so every screen shows the same numbers.
 *
 * Rules
 *  - The customer always pays the listed service price. The platform fee is
 *    taken from the technician's side.
 *  - The rate is snapshotted on the booking when a technician ACCEPTS it, so
 *    a later rate change never alters a job someone already agreed to.
 *  - The fee is stored on the booking when the job is COMPLETED.
 *  - Amounts are whole taka: fee = round(price x rate / 100).
 */
class CommissionService
{
    /** @return array{rate: float, fee: int, earning: int} */
    public static function split(int $price, float $rate): array
    {
        $fee = (int) round($price * $rate / 100);

        return [
            'rate'    => $rate,
            'fee'     => $fee,
            'earning' => $price - $fee,
        ];
    }

    /** The numbers to show for one booking (stored if completed, else estimated). */
    public static function forBooking(Booking $booking, ?float $currentRate = null): array
    {
        if ($booking->status === 'completed' && $booking->technician_earning !== null) {
            return [
                'rate'    => (float) $booking->commission_rate,
                'fee'     => (int) $booking->platform_fee,
                'earning' => (int) $booking->technician_earning,
            ];
        }

        $rate = $booking->commission_rate !== null
            ? (float) $booking->commission_rate
            : ($currentRate ?? PlatformSetting::commissionRate());

        return self::split((int) $booking->price, $rate);
    }

    /** Adds a "commission" object ({rate, fee, earning}) to every booking in a list. */
    public static function attach($bookings): void
    {
        $current = PlatformSetting::commissionRate();

        foreach ($bookings as $booking) {
            $booking->setAttribute('commission', self::forBooking($booking, $current));
        }
    }
}
