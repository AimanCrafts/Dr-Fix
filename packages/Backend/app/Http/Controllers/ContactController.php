<?php

namespace App\Http\Controllers;

use App\Models\ContactMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * ContactController
 * -----------------
 * POST /api/contact — public "Contact Us" form. Messages are stored in the
 * contact_messages table. Throttled in routes/api.php (5 per minute).
 */
class ContactController extends Controller
{
    private const TOPICS = [
        'booking', 'payment', 'technician', 'feedback', 'other',
    ];

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'    => 'required|string|max:100',
            'email'   => 'required|email|max:150',
            'phone'   => 'nullable|string|max:20',
            'topic'   => 'required|string|in:' . implode(',', self::TOPICS),
            'message' => 'required|string|min:10|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 422);
        }

        ContactMessage::create($validator->validated());

        return response()->json([
            'message' => 'Thanks! We have received your message.',
        ], 201);
    }
}
