<?php

namespace App\Http\Controllers;

use App\Mail\ProviderApprovedMail;
use App\Mail\ProviderRejectedMail;
use App\Models\User;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

/**
 * AdminTechnicianController
 * --------------------------
 * Everything an admin needs to review provider applications. All routes
 * live behind 'admin.auth' (session-based, same guard as AdminAuthController)
 * — see routes/api.php.
 */
class AdminTechnicianController extends Controller
{
    /**
     * GET /api/admin/technicians?status=pending
     * status is optional: pending | approved | rejected. Omit for all.
     */
    public function index(Request $request)
    {
        $query = User::where('role', 'provider');

        if ($request->filled('status')) {
            $query->where('approval_status', $request->query('status'));
        }

        $providers = $query->latest()->get([
            'id', 'name', 'email', 'phone', 'service_category',
            'years_of_experience', 'work_area', 'nid_path',
            'approval_status', 'created_at',
        ]);

        // Turn the stored nid_path into a URL the admin frontend can open
        // directly (requires `php artisan storage:link` — see setup note).
        $providers->transform(function ($p) {
            $p->nid_url = $p->nid_path ? Storage::disk('public')->url($p->nid_path) : null;
            return $p;
        });

        return response()->json($providers);
    }

    /** GET /api/public/technicians — approved technicians for the public home page. */
    public function publicIndex()
    {
        $providers = User::where('role', 'provider')
            ->where('approval_status', 'approved')
            ->latest()
            ->limit(8)
            ->get([
                'id', 'name', 'service_category', 'years_of_experience', 'work_area',
            ]);

        $ratings = Review::whereIn('technician_id', $providers->pluck('id'))
            ->selectRaw('technician_id, AVG(rating) as average_rating, COUNT(*) as review_count')
            ->groupBy('technician_id')
            ->get()
            ->keyBy('technician_id');

        $providers->transform(function ($provider) use ($ratings) {
            $rating = $ratings->get($provider->id);
            $provider->rating = $rating ? round((float) $rating->average_rating, 1) : null;
            $provider->review_count = $rating ? (int) $rating->review_count : 0;
            return $provider;
        });

        return response()->json($providers);
    }

    /**
     * GET /api/admin/technicians/{id}
     * Full detail view for a single applicant (used by a review page).
     */
    public function show(int $id)
    {
        $provider = User::where('role', 'provider')->findOrFail($id);
        $provider->nid_url = $provider->nid_path
            ? Storage::disk('public')->url($provider->nid_path)
            : null;

        return response()->json($provider);
    }

    /**
     * POST /api/admin/technicians/{id}/approve
     */
    public function approve(int $id)
    {
        $provider = User::where('role', 'provider')->findOrFail($id);
        $provider->update(['approval_status' => 'approved']);

        Mail::to($provider->email)->send(new ProviderApprovedMail($provider->name));

        return response()->json([
            'message' => 'Provider approved.',
            'approval_status' => $provider->approval_status,
        ]);
    }

    /**
     * POST /api/admin/technicians/{id}/reject
     * Body: { "reason": "optional string shown in the email" }
     */
    public function reject(int $id, Request $request)
    {
        $request->validate(['reason' => 'nullable|string|max:500']);

        $provider = User::where('role', 'provider')->findOrFail($id);
        $provider->update(['approval_status' => 'rejected']);

        Mail::to($provider->email)->send(
            new ProviderRejectedMail($provider->name, $request->input('reason'))
        );

        return response()->json([
            'message' => 'Provider rejected.',
            'approval_status' => $provider->approval_status,
        ]);
    }
}
