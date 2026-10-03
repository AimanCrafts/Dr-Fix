<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

/**
 * Sent from AdminTechnicianController::approve() — same pattern as
 * OtpMail (plain Mailable + blade view), just a different template.
 */
class ProviderApprovedMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $name;

    public function __construct(string $name)
    {
        $this->name = $name;
    }

    public function build()
    {
        return $this->subject('Your Dr.-Fix Provider Application is Approved')
            ->view('emails.provider-approved')
            ->with(['name' => $this->name]);
    }
}
