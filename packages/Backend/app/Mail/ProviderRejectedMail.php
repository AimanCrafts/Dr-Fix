<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ProviderRejectedMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $name;
    public ?string $reason;

    public function __construct(string $name, ?string $reason = null)
    {
        $this->name = $name;
        $this->reason = $reason;
    }

    public function build()
    {
        return $this->subject('Update on Your Dr.-Fix Provider Application')
            ->view('emails.provider-rejected')
            ->with(['name' => $this->name, 'reason' => $this->reason]);
    }
}
