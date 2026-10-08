<?php

namespace App\Http\Controllers;

use App\Models\PlatformSetting;
use App\Models\Service;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * ServiceController
 * -----------------
 * The service list + prices live in the database. Admins can change a
 * price or hide a service; they cannot add or rename services (the icons
 * and category cards are part of the frontend code).
 */
class ServiceController extends Controller
{
    /** GET /api/public/services - what the Services page and Checkout show */
    public function publicIndex()
    {
        return response()->json(
            Service::where('is_active', true)
                ->orderBy('category')
                ->orderBy('sort_order')
                ->get(['id', 'category', 'name', 'price'])
        );
    }

    /** GET /api/public/commission - shown on the technician sign-up form */
    public function publicCommission()
    {
        return response()->json(['rate' => PlatformSetting::commissionRate()]);
    }

    /**
     * GET /api/public/availability?category=electric
     * How many approved, available technicians currently cover a category.
     * Checkout uses this to warn when nobody can take the job right now.
     */
    public function availability(Request $request)
    {
        $category = (string) $request->query('category', '');

        $count = User::where('role', 'provider')
            ->where('approval_status', 'approved')
            ->whereNull('deactivated_at')
            ->where('is_available', true)
            ->where('service_category', $category)
            ->count();

        return response()->json(['technicians' => $count]);
    }

    /** GET /api/admin/services */
    public function adminIndex()
    {
        return response()->json([
            'services'        => Service::orderBy('category')->orderBy('sort_order')->get(),
            'commission_rate' => PlatformSetting::commissionRate(),
        ]);
    }

    /** PUT /api/admin/services/{id} - change price and/or visibility */
    public function adminUpdate(Request $request, int $id)
    {
        $service = Service::find($id);

        if (! $service) {
            return response()->json(['message' => 'Service not found.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'price'     => 'sometimes|required|integer|min:1|max:100000',
            'is_active' => 'sometimes|required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => $validator->errors()->first(),
                'errors'  => $validator->errors(),
            ], 422);
        }

        $service->update($validator->validated());

        return response()->json($service);
    }

    /** PUT /api/admin/commission - the platform fee percentage */
    public function adminCommission(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'rate' => 'required|numeric|min:0|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => $validator->errors()->first(),
                'errors'  => $validator->errors(),
            ], 422);
        }

        $old = PlatformSetting::commissionRate();
        $new = round((float) $request->rate, 2);

        PlatformSetting::setCommissionRate($new);

        if ($old !== $new) {
            NotificationService::commissionChanged($old, $new);
        }

        return response()->json(['commission_rate' => $new]);
    }
}
