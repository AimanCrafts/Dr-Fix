<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background:#f6f6f6; padding:24px;">
    <div style="max-width:480px; margin:0 auto; background:#ffffff; border-radius:8px; padding:32px;">
        @if ($event === 'completed')
            <h2 style="color:#111; margin-top:0;">Your service is completed</h2>
            <p style="color:#555;">
                Hi {{ $customer }}, {{ $tech }} has marked your
                <strong>{{ $booking->service_name }}</strong> service as completed.
                You can now rate the service from your Dr.-Fix dashboard.
            </p>
        @else
            <h2 style="color:#111; margin-top:0;">Your booking was accepted</h2>
            <p style="color:#555;">
                Hi {{ $customer }}, {{ $tech }} has accepted your
                <strong>{{ $booking->service_name }}</strong> booking.
            </p>
            <p style="color:#555;">
                Scheduled: <strong>{{ $booking->date_label }}, {{ $booking->time_slot }}</strong>
            </p>
        @endif
        <p style="color:#999; font-size:12px; margin-bottom:0;">
            You can turn these emails off any time in Settings &rarr; Email notifications.
        </p>
    </div>
</body>
</html>
