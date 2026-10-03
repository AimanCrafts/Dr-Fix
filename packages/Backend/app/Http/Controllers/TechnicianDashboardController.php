<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Review;
use Carbon\Carbon;
use Illuminate\Http\Request;

class TechnicianDashboardController extends Controller
{
    private function technician(Request $request)
    {
        return $request->attributes->get('technician');
    }

    public function summary(Request $request)
    {
        $technician = $this->technician($request);

        $completed = Booking::where('technician_id', $technician->id)
            ->where('status', 'completed');

        $completedToday = (clone $completed)->whereDate('completed_at', today())->count();
        $active = Booking::where('technician_id', $technician->id)
            ->whereIn('status', ['accepted', 'in_progress'])
            ->count();
        $pending = Booking::where('status', 'pending')
            ->where('service_category', $technician->service_category)
            ->count();

        $totalEarnings = (clone $completed)->sum('price');
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
        ]);
    }

    public function earnings(Request $request)
    {
        $technician = $this->technician($request);
        $now = Carbon::now();

        $base = Booking::where('technician_id', $technician->id)
            ->where('status', 'completed');

        $today = (clone $base)->whereDate('completed_at', $now->toDateString())->sum('price');
        $thisWeek = (clone $base)
            ->whereBetween('completed_at', [$now->copy()->startOfWeek(), $now->copy()->endOfWeek()])
            ->sum('price');
        $thisMonth = (clone $base)
            ->whereBetween('completed_at', [$now->copy()->startOfMonth(), $now->copy()->endOfMonth()])
            ->sum('price');

        $jobs = (clone $base)
            ->with('customer:id,name')
            ->latest('completed_at')
            ->limit(50)
            ->get();

        return response()->json([
            'today' => (int) $today,
            'this_week' => (int) $thisWeek,
            'this_month' => (int) $thisMonth,
            'total' => (int) $base->sum('price'),
            'jobs' => $jobs,
        ]);
    }

    public function schedule(Request $request)
    {
        $technician = $this->technician($request);

        $jobs = Booking::where('technician_id', $technician->id)
            ->whereIn('status', ['accepted', 'in_progress'])
            ->with('customer:id,name,phone')
            ->orderBy('date_label')
            ->orderBy('time_slot')
            ->get();

        return response()->json($jobs);
    }
}
