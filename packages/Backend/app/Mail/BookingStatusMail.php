<?php

namespace App\Mail;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

/**
 * "Your booking was accepted" / "Your service is completed" emails.
 * Same pattern as OtpMail: a plain Mailable plus a blade view.
 */
class BookingStatusMail extends Mailable
{
    use Queueable, SerializesModels;

    public Booking $booking;
    public string $event;

    public function __construct(Booking $booking, string $event)
    {
        $this->booking = $booking;
        $this->event = $event;
    }

    public function build()
    {
        $subject = $this->event === 'completed'
            ? 'Your Dr.-Fix service is completed'
            : 'Your Dr.-Fix booking was accepted';

        return $this->subject($subject)
            ->view('emails.booking-status')
            ->with([
                'booking'  => $this->booking,
                'event'    => $this->event,
                'customer' => $this->booking->customer?->name ?? 'there',
                'tech'     => $this->booking->technician?->name ?? 'A technician',
            ]);
    }
}
