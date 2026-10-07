<?php

namespace App\Http\Controllers;

use App\Models\Review;
use Illuminate\Http\Request;

/**
 * TechnicianReviewController
 * --------------------------
 * GET /api/technician/reviews - the logged-in technician's own reviews.
 *
 * The reviewer is shown as first name + last initial ("Munawar M."). The
 * technician already knows the customer from the job, but the full name
 * and phone are never put in a review list.
 */
class TechnicianReviewController extends Controller
{
    private static function shortName(?string $name): string
    {
        $parts = preg_split('/\s+/', trim((string) $name), -1, PREG_SPLIT_NO_EMPTY);

        if (! $parts) {
            return 'Customer';
        }

        if (count($parts) === 1) {
            return $parts[0];
        }

        return $parts[0] . ' ' . mb_strtoupper(mb_substr(end($parts), 0, 1)) . '.';
    }

    public function index(Request $request)
    {
        $technician = $request->attributes->get('technician');

        $base = Review::where('technician_id', $technician->id);

        $count = (clone $base)->count();
        $average = (clone $base)->avg('rating');

        $counts = (clone $base)
            ->selectRaw('rating, COUNT(*) as total')
            ->groupBy('rating')
            ->pluck('total', 'rating');

        $distribution = [];
        foreach ([5, 4, 3, 2, 1] as $stars) {
            $distribution[$stars] = (int) ($counts[$stars] ?? 0);
        }

        $items = Review::where('technician_id', $technician->id)
            ->with(['customer:id,name', 'booking:id,service_name'])
            ->latest()
            ->limit(50)
            ->get(['id', 'booking_id', 'customer_id', 'rating', 'review', 'created_at'])
            ->map(fn ($review) => [
                'id'            => $review->id,
                'rating'        => $review->rating,
                'review'        => $review->review,
                'created_at'    => $review->created_at,
                'service_name'  => $review->booking?->service_name,
                'reviewer_name' => self::shortName($review->customer?->name),
            ]);

        return response()->json([
            'average'      => $average !== null ? round((float) $average, 1) : null,
            'count'        => $count,
            'distribution' => $distribution,
            'items'        => $items,
        ]);
    }
}
