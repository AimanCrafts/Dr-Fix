<?php

namespace App\Http\Controllers;

use App\Models\UserNotification;
use Illuminate\Http\Request;

/**
 * NotificationController
 * ----------------------
 * Serves the bell icon for both roles. Routes live under /notifications
 * (customer) and /technician/notifications (technician), each behind its
 * own jwt.auth:<role> middleware. Every query is scoped to the logged-in
 * user, so nobody can read or mark someone else's notifications.
 */
class NotificationController extends Controller
{
    private function userId(Request $request): int
    {
        return $request->attributes->get('jwt_user')->id;
    }

    private function unreadCountFor(int $userId): int
    {
        return UserNotification::where('user_id', $userId)
            ->whereNull('read_at')
            ->count();
    }

    /** GET .../notifications  - latest items + unread count */
    public function index(Request $request)
    {
        $userId = $this->userId($request);
        $limit = max(1, min((int) $request->query('limit', 20), 50));

        $items = UserNotification::where('user_id', $userId)
            ->orderByDesc('id')
            ->limit($limit)
            ->get(['id', 'type', 'title', 'body', 'link', 'read_at', 'created_at']);

        return response()->json([
            'items'        => $items,
            'unread_count' => $this->unreadCountFor($userId),
        ]);
    }

    /** GET .../notifications/unread-count  - tiny, polled by the bell */
    public function unreadCount(Request $request)
    {
        return response()->json([
            'unread_count' => $this->unreadCountFor($this->userId($request)),
        ]);
    }

    /** POST .../notifications/{id}/read */
    public function markRead(Request $request, int $id)
    {
        $userId = $this->userId($request);

        $notification = UserNotification::where('user_id', $userId)->find($id);

        if (! $notification) {
            return response()->json(['message' => 'Notification not found.'], 404);
        }

        if (! $notification->read_at) {
            $notification->update(['read_at' => now()]);
        }

        return response()->json(['unread_count' => $this->unreadCountFor($userId)]);
    }

    /** POST .../notifications/read-all */
    public function markAllRead(Request $request)
    {
        $userId = $this->userId($request);

        UserNotification::where('user_id', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['unread_count' => 0]);
    }
}
