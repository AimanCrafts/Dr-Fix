<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Service;
use App\Services\NotificationService;
use Carbon\Carbon;
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
    /** Allowed time windows. They must not overlap, and match checkout.jsx. */
    private const SLOTS = [
        '8-11 AM'     => 8,
        '11 AM-2 PM'  => 11,
        '2-5 PM'      => 14,
        '5-8 PM'      => 17,
    ];

    public function store(Request $request)
    {
        // NOTE: price and category are deliberately NOT accepted from the
        // browser any more. They come from the services table below.
        $validator = Validator::make($request->all(), [
            'service_name'   => 'required|string|max:150',
            'address'        => 'required|string|max:255',
            'scheduled_date' => 'required|date_format:Y-m-d',
            'time_slot'      => 'required|string|in:' . implode(',', array_keys(self::SLOTS)),
            'instructions'   => 'nullable|string|max:250',
            'payment_method' => 'required|string|in:cash',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $service = Service::where('name', $request->service_name)
            ->where('is_active', true)
            ->first();

        if (! $service) {
            return response()->json([
                'message' => 'This service is not available right now.',
            ], 422);
        }

        // "Today" means today in Bangladesh, not in the server's UTC clock.
        $nowDhaka = Carbon::now('Asia/Dhaka');
        $today = $nowDhaka->copy()->startOfDay();
        $date = Carbon::createFromFormat('Y-m-d', $request->scheduled_date, 'Asia/Dhaka')->startOfDay();

        if ($date->lt($today) || $date->gt($today->copy()->addDays(30))) {
            return response()->json([
                'message' => 'Please choose a date within the next 30 days.',
            ], 422);
        }

        if ($date->equalTo($today)) {
            $slotStart = $date->copy()->setHour(self::SLOTS[$request->time_slot]);

            // at least one hour of notice for same-day jobs
            if ($nowDhaka->gt($slotStart->copy()->subHour())) {
                return response()->json([
                    'message' => 'That time slot is no longer available today. Please pick a later one.',
                ], 422);
            }
        }

        $customer = $request->attributes->get('customer');

        $booking = Booking::create([
            'customer_id'       => $customer->id,
            'service_category'  => $service->category,
            'service_name'      => $service->name,
            'price'             => $service->price,
            'address'           => $request->address,
            'scheduled_date'    => $date->toDateString(),
            'date_label'        => $date->format('D, j M'),
            'time_slot'         => $request->time_slot,
            'instructions'      => $request->instructions,
            'payment_method'    => $request->payment_method,
            'status'            => 'pending',
        ]);

        // Tell matching, available technicians there is a new job.
        NotificationService::newJob($booking);

        return response()->json($booking, 201);
    }

    /** GET /api/bookings — the logged-in customer's own bookings. */
    public function index(Request $request)
    {
        $customer = $request->attributes->get('customer');

        $bookings = Booking::where('customer_id', $customer->id)
            ->with(['technician:id,name,phone', 'review'])
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
            ->with(['technician:id,name,phone', 'review'])
            ->find($id);

        if (! $booking) {
            return response()->json(['message' => 'Booking not found.'], 404);
        }

        return response()->json($booking);
    }
}
