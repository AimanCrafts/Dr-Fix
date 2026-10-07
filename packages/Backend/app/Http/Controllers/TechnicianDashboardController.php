<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\PlatformSetting;
use App\Models\Review;
use App\Services\CommissionService;
use Carbon\Carbon;
use Illuminate\Http\Request;

class TechnicianDashboardController extends Controller
{
    private function technician(Request $request)
    {
        return $request->attributes->get('technician');
    }

    /**
     * Start/end of "today", "this week" or "this month" in Bangladesh time,
     * converted to UTC because completed_at is stored in UTC. (The server
     * clock is UTC, so using now()/today() directly made "today" reset at
     * 6 AM Dhaka time.)
     */
    private function window(string $unit): array
    {
        $now = Carbon::now('Asia/Dhaka');

        [$start, $end] = match ($unit) {
            'week'  => [$now->copy()->startOfWeek(), $now->copy()->endOfWeek()],
            'month' => [$now->copy()->startOfMonth(), $now->copy()->endOfMonth()],
            default => [$now->copy()->startOfDay(), $now->copy()->endOfDay()],
        };

        return [$start->utc(), $end->utc()];
    }

    public function summary(Request $request)
    {
        $technician = $this->technician($request);

        $completed = Booking::where('technician_id', $technician->id)
            ->where('status', 'completed');

        $completedToday = (clone $completed)->whereBetween('completed_at', $this->window('day'))->count();
        $active = Booking::where('technician_id', $technician->id)
            ->whereIn('status', ['accepted', 'in_progress'])
            ->count();
        $pending = Booking::where('status', 'pending')
            ->where('service_category', $technician->service_category)
            ->count();

        $totalEarnings = (clone $completed)->sum('technician_earning');
        $ratings = Review::where('technician_id', $technician->id);
        $reviewCount = (clone $ratings)->count();
        $averageRating = (clone $ratings)->avg('rating');

        return response()->json([
            'today_completed' => $completedToday,
            'active_jobs' => $active,
            'available_requests' => $pending,
            'total_earnings' => (int) $totalEarnings,
            'rating' => $averageRating !== null ? round((float) $averageRating, 1) : null,
            'review_count' => $reviewCount,
            'is_available' => (bool) $technician->is_available,
            'commission_rate' => PlatformSetting::commissionRate(),
        ]);
    }

    public function earnings(Request $request)
    {
        $technician = $this->technician($request);

        $base = Booking::where('technician_id', $technician->id)
            ->where('status', 'completed');

        // Net amounts = what the technician actually keeps after the platform fee.
        $today = (clone $base)->whereBetween('completed_at', $this->window('day'))->sum('technician_earning');
        $thisWeek = (clone $base)->whereBetween('completed_at', $this->window('week'))->sum('technician_earning');
        $thisMonth = (clone $base)->whereBetween('completed_at', $this->window('month'))->sum('technician_earning');

        $jobs = (clone $base)
            ->with('customer:id,name')
            ->latest('completed_at')
            ->limit(50)
            ->get();

        CommissionService::attach($jobs);

        return response()->json([
            'today' => (int) $today,
            'this_week' => (int) $thisWeek,
            'this_month' => (int) $thisMonth,
            'total' => (int) (clone $base)->sum('technician_earning'),
            'gross_total' => (int) (clone $base)->sum('price'),
            'fee_total' => (int) (clone $base)->sum('platform_fee'),
            'commission_rate' => PlatformSetting::commissionRate(),
            'jobs' => $jobs,
        ]);
    }

    public function schedule(Request $request)
    {
        $technician = $this->technician($request);

        $jobs = Booking::where('technician_id', $technician->id)
            ->whereIn('status', ['accepted', 'in_progress'])
            ->with('customer:id,name,phone')
            ->orderBy('scheduled_date')
            ->orderBy('time_slot')
            ->get();

        CommissionService::attach($jobs);

        return response()->json($jobs);
    }
}
