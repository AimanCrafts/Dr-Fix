<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Review;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReviewController extends Controller
{
    public function recent()
    {
        $reviews = Review::with([
            'technician:id,name,service_category',
            'booking:id,address',
        ])
            ->whereNotNull('technician_id')
            ->latest()
            ->limit(6)
            ->get([
                'id', 'booking_id', 'technician_id', 'rating', 'review', 'created_at',
            ]);

        return response()->json($reviews);
    }

    public function store(Request $request, int $bookingId)
    {
        $validator = Validator::make($request->all(), [
            'rating' => 'required|integer|min:1|max:5',
            'review' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $customer = $request->attributes->get('customer');

        $booking = Booking::where('id', $bookingId)
            ->where('customer_id', $customer->id)
            ->where('status', 'completed')
            ->with('technician:id,name,phone')
            ->first();

        if (! $booking) {
            return response()->json([
                'message' => 'Completed booking not found.',
            ], 404);
        }

        if ($booking->review()->exists()) {
            return response()->json([
                'message' => 'This service has already been reviewed.',
            ], 409);
        }

        $review = Review::create([
            'booking_id' => $booking->id,
            'customer_id' => $customer->id,
            'technician_id' => $booking->technician_id,
            'rating' => $request->rating,
            'review' => $request->review,
        ]);

        NotificationService::reviewReceived($review);

        return response()->json($review, 201);
    }
}
