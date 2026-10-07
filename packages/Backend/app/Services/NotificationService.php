<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Review;
use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Support\Facades\Log;

/**
 * NotificationService
 * -------------------
 * Creates the in-app notifications shown behind the bell icon.
 *
 * Every method swallows its own errors (they are only logged): a failed
 * notification must never break the real action (placing a booking,
 * accepting a job, leaving a review).
 */
class NotificationService
{
    /** Create one notification for one user. */
    public static function push(
        int $userId,
        string $type,
        string $title,
        ?string $body = null,
        ?string $link = null
    ): void {
        try {
            UserNotification::create([
                'user_id' => $userId,
                'type'    => $type,
                'title'   => $title,
                'body'    => $body,
                'link'    => $link,
            ]);
        } catch (\Throwable $e) {
            Log::warning('Notification failed: ' . $e->getMessage());
        }
    }

    /** Customer: their booking was accepted / started / completed. */
    public static function bookingEvent(int $bookingId, string $event): void
    {
        try {
            $booking = Booking::with('technician:id,name')->find($bookingId);

            if (! $booking) {
                return;
            }

            $tech = $booking->technician?->name ?? 'A technician';
            $service = $booking->service_name;
            $tracking = '/booking-tracking?bookingId=' . $booking->id;

            if ($event === 'accepted') {
                self::push(
                    $booking->customer_id,
                    'booking_accepted',
                    'Booking accepted',
                    "{$tech} accepted your {$service} booking.",
                    $tracking
                );
            } elseif ($event === 'started') {
                self::push(
                    $booking->customer_id,
                    'booking_started',
                    'Work has started',
                    "{$tech} started working on your {$service} service.",
                    $tracking
                );
            } elseif ($event === 'completed') {
                self::push(
                    $booking->customer_id,
                    'booking_completed',
                    'Service completed',
                    "Your {$service} service is done. Tell us how it went.",
                    '/client_dashboard'
                );
            }
        } catch (\Throwable $e) {
            Log::warning('Booking notification failed: ' . $e->getMessage());
        }
    }

    /**
     * Technicians: a new job matching their category was posted.
     * Only approved, active, available technicians are notified.
     */
    public static function newJob(Booking $booking): void
    {
        try {
            $technicianIds = User::where('role', 'provider')
                ->where('approval_status', 'approved')
                ->whereNull('deactivated_at')
                ->where('is_available', true)
                ->where('service_category', $booking->service_category)
                ->limit(200)
                ->pluck('id');

            if ($technicianIds->isEmpty()) {
                return;
            }

            $now = now();
            $body = "{$booking->service_name} - {$booking->date_label}, {$booking->time_slot}";

            $rows = $technicianIds->map(fn ($id) => [
                'user_id'    => $id,
                'type'       => 'new_job',
                'title'      => 'New job request',
                'body'       => mb_substr($body, 0, 255),
                'link'       => '/technician/job-requests',
                'created_at' => $now,
                'updated_at' => $now,
            ])->all();

            UserNotification::insert($rows);
        } catch (\Throwable $e) {
            Log::warning('New-job notification failed: ' . $e->getMessage());
        }
    }

    /** Technicians: the platform fee percentage changed. */
    public static function commissionChanged(float $old, float $new): void
    {
        try {
            $ids = User::where('role', 'provider')
                ->where('approval_status', 'approved')
                ->whereNull('deactivated_at')
                ->limit(1000)
                ->pluck('id');

            if ($ids->isEmpty()) {
                return;
            }

            $now = now();
            $rows = $ids->map(fn ($id) => [
                'user_id'    => $id,
                'type'       => 'commission_changed',
                'title'      => 'Platform fee updated',
                'body'       => "The fee changed from {$old}% to {$new}%. It applies to jobs you accept from now on.",
                'link'       => '/technician/earnings',
                'created_at' => $now,
                'updated_at' => $now,
            ])->all();

            UserNotification::insert($rows);
        } catch (\Throwable $e) {
            Log::warning('Commission notification failed: ' . $e->getMessage());
        }
    }

    /** Technician: a customer left a review. */
    public static function reviewReceived(Review $review): void
    {
        try {
            if (! $review->technician_id) {
                return;
            }

            $service = Booking::where('id', $review->booking_id)->value('service_name') ?? 'a service';
            $stars = (int) $review->rating;

            self::push(
                $review->technician_id,
                'review_received',
                'New review',
                "You received {$stars} star" . ($stars === 1 ? '' : 's') . " for {$service}.",
                '/technician/reviews'
            );
        } catch (\Throwable $e) {
            Log::warning('Review notification failed: ' . $e->getMessage());
        }
    }
}
