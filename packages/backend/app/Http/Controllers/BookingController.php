<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * BookingController (customer side)
 * -----------------------------------
 * Behind jwt.auth:customer (see routes/api.php). The customer resolved
 * by that middleware is available at $request->attributes->get('customer').
 *
 * store() replaces the fake client-side booking ID that used to be
 * generated in checkout.jsx's handleConfirm(). No technician is assigned
 * here — it's created as "pending" and technicians claim it themselves
 * (see TechnicianBookingController::accept).
 */
class BookingController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'service_category' => 'required|string|max:100',
            'service_name'     => 'required|string|max:150',
            'price'            => 'required|integer|min:0',
            'address'          => 'required|string|max:255',
            'date_label'       => 'required|string|max:50',
            'time_slot'        => 'required|string|max:50',
            'instructions'     => 'nullable|string|max:250',
            'payment_method'   => 'required|string|in:cash,bkash,nagad',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $customer = $request->attributes->get('customer');

        $booking = Booking::create([
            'customer_id'       => $customer->id,
            'service_category'  => $request->service_category,
            'service_name'      => $request->service_name,
            'price'             => $request->price,
            'address'           => $request->address,
            'date_label'        => $request->date_label,
            'time_slot'         => $request->time_slot,
            'instructions'      => $request->instructions,
            'payment_method'    => $request->payment_method,
            'status'            => 'pending',
        ]);

        return response()->json($booking, 201);
    }

    /** GET /api/bookings — the logged-in customer's own bookings. */
    public function index(Request $request)
    {
        $customer = $request->attributes->get('customer');

        $bookings = Booking::where('customer_id', $customer->id)
            ->with('technician:id,name,phone')
            ->latest()
            ->get();

        return response()->json($bookings);
    }

    /**
     * GET /api/bookings/{id} — used by confirmation.jsx to poll whether
     * a technician has accepted yet. Scoped to the owning customer only.
     */
    public function show(Request $request, int $id)
    {
        $customer = $request->attributes->get('customer');

        $booking = Booking::where('customer_id', $customer->id)
            ->with('technician:id,name,phone')
            ->find($id);

        if (! $booking) {
            return response()->json(['message' => 'Booking not found.'], 404);
        }

        return response()->json($booking);
    }
}
