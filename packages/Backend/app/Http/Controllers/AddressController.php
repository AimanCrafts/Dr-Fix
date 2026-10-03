<?php

namespace App\Http\Controllers;

use App\Models\Address;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * AddressController
 * ------------------
 * CRUD for a customer's own saved addresses. Every method is scoped to
 * the authenticated customer (jwt.auth:customer) — a customer can only
 * ever see/edit/delete their own rows, never anyone else's.
 */
class AddressController extends Controller
{
    /** GET /api/addresses */
    public function index(Request $request)
    {
        $customer = $request->attributes->get('customer');

        $addresses = Address::where('user_id', $customer->id)
            ->orderByDesc('is_default')
            ->latest()
            ->get();

        return response()->json($addresses);
    }

    /** POST /api/addresses */
    public function store(Request $request)
    {
        $customer = $request->attributes->get('customer');

        $validator = Validator::make($request->all(), [
            'label'  => 'required|string|max:50',
            'detail' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 422);
        }

        // First address a customer ever saves becomes their default automatically.
        $isFirst = Address::where('user_id', $customer->id)->doesntExist();

        $address = Address::create([
            'user_id'    => $customer->id,
            'label'      => $request->label,
            'detail'     => $request->detail,
            'is_default' => $isFirst,
        ]);

        return response()->json($address, 201);
    }

    /** PUT /api/addresses/{id} */
    public function update(Request $request, int $id)
    {
        $customer = $request->attributes->get('customer');

        $address = Address::where('user_id', $customer->id)->find($id);

        if (!$address) {
            return response()->json(['message' => 'Address not found.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'label'  => 'sometimes|required|string|max:50',
            'detail' => 'sometimes|required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $address->update($request->only(['label', 'detail']));

        return response()->json($address);
    }

    /** POST /api/addresses/{id}/default — make this the default address. */
    public function makeDefault(Request $request, int $id)
    {
        $customer = $request->attributes->get('customer');

        $address = Address::where('user_id', $customer->id)->find($id);

        if (!$address) {
            return response()->json(['message' => 'Address not found.'], 404);
        }

        Address::where('user_id', $customer->id)->update(['is_default' => false]);
        $address->update(['is_default' => true]);

        return response()->json($address);
    }

    /** DELETE /api/addresses/{id} */
    public function destroy(Request $request, int $id)
    {
        $customer = $request->attributes->get('customer');

        $address = Address::where('user_id', $customer->id)->find($id);

        if (!$address) {
            return response()->json(['message' => 'Address not found.'], 404);
        }

        $wasDefault = $address->is_default;
        $address->delete();

        // If we just deleted the default address, promote the next one (if any).
        if ($wasDefault) {
            $next = Address::where('user_id', $customer->id)->first();
            $next?->update(['is_default' => true]);
        }

        return response()->json(['message' => 'Address deleted.']);
    }
}
