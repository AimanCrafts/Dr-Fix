<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\PlatformSetting;
use App\Services\BookingExpiry;
use App\Services\BookingNotifier;
use App\Services\CommissionService;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Technician booking workflow.
 *
 * The technician has only three actions after seeing a request:
 *   1. Accept Job
 *   2. Start Service
 *   3. Complete Service
 *
 * Booking statuses are intentionally simple:
 *   pending -> accepted -> in_progress -> completed
 *   pending -> cancelled (customer/admin side)
 */
class TechnicianBookingController extends Controller
{
    /** GET /api/technician/bookings/available */
    public function available(Request $request)
    {
        BookingExpiry::sweep();

        $technician = $request->attributes->get('technician');

        if ($technician->approval_status !== 'approved') {
            return response()->json(['message' => 'Your account is not approved yet.'], 403);
        }

        $jobs = Booking::where('status', 'pending')
            ->where('service_category', $technician->service_category)
            // hide jobs this technician already rejected
            ->whereNotExists(function ($q) use ($technician) {
                $q->select(DB::raw(1))
                    ->from('technician_booking_rejections')
                    ->whereColumn('technician_booking_rejections.booking_id', 'bookings.id')
                    ->where('technician_booking_rejections.technician_id', $technician->id);
            })
            ->with('customer:id,name,phone')
            ->latest()
            ->get();

        CommissionService::attach($jobs);

        return response()->json($jobs);
    }

    /** GET /api/technician/bookings/mine */
    public function mine(Request $request)
    {
        $technician = $request->attributes->get('technician');

        $jobs = Booking::where('technician_id', $technician->id)
            ->with('customer:id,name,phone')
            ->latest()
            ->get();

        CommissionService::attach($jobs);

        return response()->json($jobs);
    }

    /** POST /api/technician/bookings/{id}/accept */
    public function accept(Request $request, int $id)
    {
        $technician = $request->attributes->get('technician');

        if ($technician->approval_status !== 'approved') {
            return response()->json(['message' => 'Your account is not approved yet.'], 403);
        }

        $affected = DB::table('bookings')
            ->where('id', $id)
            ->where('status', 'pending')
            ->whereNull('technician_id')
            ->update([
                'status' => 'accepted',
                'technician_id' => $technician->id,
                'accepted_at' => now(),
                'commission_rate' => PlatformSetting::commissionRate(),
                'updated_at' => now(),
            ]);

        if ($affected === 0) {
            return response()->json([
                'message' => 'This job was already accepted by another technician.',
            ], 409);
        }

        BookingNotifier::customer($id, 'accepted');
        NotificationService::bookingEvent($id, 'accepted');

        return response()->json(Booking::with('customer:id,name,phone')->find($id));
    }

    /** POST /api/technician/bookings/{id}/reject */
    public function reject(Request $request, int $id)
    {
        $technician = $request->attributes->get('technician');

        if ($technician->approval_status !== 'approved') {
            return response()->json(['message' => 'Your account is not approved yet.'], 403);
        }

        $exists = DB::table('bookings')
            ->where('id', $id)
            ->where('status', 'pending')
            ->exists();

        if (! $exists) {
            return response()->json([
                'message' => 'This job is no longer available.',
            ], 404);
        }

        DB::table('technician_booking_rejections')->updateOrInsert(
            ['technician_id' => $technician->id, 'booking_id' => $id],
            ['created_at' => now(), 'updated_at' => now()]
        );

        return response()->json(['message' => 'Job rejected.']);
    }

    /** POST /api/technician/bookings/{id}/start */
    public function start(Request $request, int $id)
    {
        $technician = $request->attributes->get('technician');

        $affected = DB::table('bookings')
            ->where('id', $id)
            ->where('technician_id', $technician->id)
            ->where('status', 'accepted')
            ->update([
                'status' => 'in_progress',
                'started_at' => now(),
                'updated_at' => now(),
            ]);

        if ($affected === 0) {
            return response()->json([
                'message' => 'This job cannot be started. It may no longer be assigned to you.',
            ], 422);
        }

        NotificationService::bookingEvent($id, 'started');

        return response()->json(Booking::with('customer:id,name,phone')->find($id));
    }

    /** POST /api/technician/bookings/{id}/complete */
    public function complete(Request $request, int $id)
    {
        $technician = $request->attributes->get('technician');

        $row = DB::table('bookings')
            ->where('id', $id)
            ->where('technician_id', $technician->id)
            ->where('status', 'in_progress')
            ->first();

        if (! $row) {
            return response()->json([
                'message' => 'This job cannot be completed before the service is started.',
            ], 422);
        }

        // Use the rate agreed when the job was accepted (fall back to today's).
        $rate = $row->commission_rate !== null
            ? (float) $row->commission_rate
            : PlatformSetting::commissionRate();
        $split = CommissionService::split((int) $row->price, $rate);

        $affected = DB::table('bookings')
            ->where('id', $id)
            ->where('technician_id', $technician->id)
            ->where('status', 'in_progress')
            ->update([
                'status' => 'completed',
                'completed_at' => now(),
                'commission_rate' => $rate,
                'platform_fee' => $split['fee'],
                'technician_earning' => $split['earning'],
                'updated_at' => now(),
            ]);

        if ($affected === 0) {
            return response()->json([
                'message' => 'This job cannot be completed before the service is started.',
            ], 422);
        }

        BookingNotifier::customer($id, 'completed');
        NotificationService::bookingEvent($id, 'completed');

        return response()->json(Booking::with('customer:id,name,phone')->find($id));
    }
}
