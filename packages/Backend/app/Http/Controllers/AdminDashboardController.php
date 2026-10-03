<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\User;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    /**
     * GET /api/admin/dashboard-summary
     *
     * Live admin overview. Revenue is based on completed bookings only.
     */
    public function summary(Request $request)
    {
        $totalBookings = Booking::count();
        $completedRevenue = Booking::where('status', 'completed')->sum('price');
        $approvedTechnicians = User::where('role', 'provider')
            ->where('approval_status', 'approved')
            ->count();
        $pendingApprovals = User::where('role', 'provider')
            ->where('approval_status', 'pending')
            ->count();

        $pendingProviders = User::where('role', 'provider')
            ->where('approval_status', 'pending')
            ->latest()
            ->limit(5)
            ->get([
                'id',
                'name',
                'service_category',
                'created_at',
            ]);

        return response()->json([
            'total_bookings' => $totalBookings,
            'completed_revenue' => (int) $completedRevenue,
            'approved_technicians' => $approvedTechnicians,
            'pending_approvals' => $pendingApprovals,
            'pending_providers' => $pendingProviders,
        ]);
    }
}
