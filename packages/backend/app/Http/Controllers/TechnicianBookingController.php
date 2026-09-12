<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * TechnicianBookingController
 * -----------------------------
 * Behind jwt.auth:provider. The technician is at
 * $request->attributes->get('technician').
 *
 * "What if more than one technician gets the same request?" — handled
 * in accept() below: every approved technician whose service_category
 * matches sees the SAME pending job in their list (no reservation, no
 * timer, no "assigned to you only" — that's the point of removing the
 * old countdown-timer UI). Whoever's Accept tap reaches the server
 * first wins; everyone else gets a 409 and the job simply disappears
 * from their list on next refresh, because the WHERE clause below is
 * the only thing deciding it, not application-level locking.
 */
class TechnicianBookingController extends Controller
{
    /** GET /api/technician/bookings/available */
    public function available(Request $request)
    {
        $technician = $request->attributes->get('technician');

        if ($technician->approval_status !== 'approved') {
            return response()->json(['message' => 'Your account is not approved yet.'], 403);
        }

        $jobs = Booking::where('status', 'pending')
            ->where('service_category', $technician->service_category)
            ->latest()
            ->get();

        return response()->json($jobs);
    }

    /** GET /api/technician/bookings/mine — jobs this technician has accepted. */
    public function mine(Request $request)
    {
        $technician = $request->attributes->get('technician');

        $jobs = Booking::where('technician_id', $technician->id)
            ->with('customer:id,name,phone')
            ->latest()
            ->get();

        return response()->json($jobs);
    }

    /**
     * POST /api/technician/bookings/{id}/accept
     *
     * The atomic claim: this UPDATE only affects a row if it is STILL
     * pending and unassigned at the exact moment it runs. If two
     * technicians tap Accept within the same second, the database
     * guarantees only one UPDATE actually changes a row — there's no
     * gap where both could "win". We check affected-row count to know
     * which case happened; no separate lock/transaction needed because
     * the WHERE clause itself is the lock.
     */
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
                'status'         => 'accepted',
                'technician_id'  => $technician->id,
                'updated_at'     => now(),
            ]);

        if ($affected === 0) {
            return response()->json([
                'message' => 'This job was already accepted by another technician.',
            ], 409);
        }

        DB::table('bookings')->where('id', $id)->update(['accepted_at' => now()]);

        return response()->json(Booking::find($id));
    }

    /**
     * The three stage-transition endpoints below (onTheWay/arrived/start)
     * all follow the same shape as accept()/complete(): scoped by both
     * id AND technician_id (so a technician can only move their own job
     * forward, never someone else's by guessing an ID), and scoped by
     * the expected CURRENT status (so stages can't be skipped or
     * replayed out of order from stale UI state).
     */

    /** POST /api/technician/bookings/{id}/on-the-way */
    public function onTheWay(Request $request, int $id)
    {
        return $this->advanceStage($request, $id, 'accepted', 'on_the_way', 'on_the_way_at');
    }

    /** POST /api/technician/bookings/{id}/arrived */
    public function arrived(Request $request, int $id)
    {
        return $this->advanceStage($request, $id, 'on_the_way', 'arrived', 'arrived_at');
    }

    /** POST /api/technician/bookings/{id}/start */
    public function start(Request $request, int $id)
    {
        return $this->advanceStage($request, $id, 'arrived', 'in_progress', 'started_at');
    }

    private function advanceStage(
        Request $request,
        int $id,
        string $fromStatus,
        string $toStatus,
        string $timestampColumn
    ) {
        $technician = $request->attributes->get('technician');

        $affected = DB::table('bookings')
            ->where('id', $id)
            ->where('technician_id', $technician->id)
            ->where('status', $fromStatus)
            ->update([
                'status'          => $toStatus,
                $timestampColumn  => now(),
                'updated_at'      => now(),
            ]);

        if ($affected === 0) {
            return response()->json([
                'message' => 'This job cannot move to that stage right now (not found, not yours, or not in the expected status).',
            ], 422);
        }

        return response()->json(Booking::find($id));
    }

    /**
     * POST /api/technician/bookings/{id}/complete
     * Only the technician who accepted this specific booking can mark
     * it done — scoped by technician_id, not just id, so one technician
     * can't complete another's job by guessing an ID.
     */
    public function complete(Request $request, int $id)
    {
        $technician = $request->attributes->get('technician');

        $affected = DB::table('bookings')
            ->where('id', $id)
            ->where('technician_id', $technician->id)
            ->where('status', 'in_progress')
            ->update([
                'status'       => 'completed',
                'completed_at' => now(),
                'updated_at'   => now(),
            ]);

        if ($affected === 0) {
            return response()->json([
                'message' => 'This job cannot be marked complete (not found, not yours, or work has not been started yet).',
            ], 422);
        }

        return response()->json(Booking::find($id));
    }
}
