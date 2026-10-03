<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background:#f6f6f6; padding:24px;">
    <div style="max-width:480px; margin:0 auto; background:#ffffff; border-radius:8px; padding:32px; text-align:center;">
        <h2 style="color:#111;">Update on your application, {{ $name }}</h2>
        <p style="color:#555;">
            Thanks for applying to become a Dr.-Fix provider. After review, we're unable to
            approve your application at this time.
        </p>
        @if($reason)
        <p style="color:#555; background:#f9f0f0; border-radius:6px; padding:12px;">
            <strong>Reason:</strong> {{ $reason }}
        </p>
        @endif
        <p style="color:#999; font-size:12px;">If you think this is a mistake, please contact support.</p>
    </div>
</body>
</html>
