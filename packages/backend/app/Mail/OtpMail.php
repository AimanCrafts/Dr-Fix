<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $code;

    /**
     * Create a new message instance.
     */
    public function __construct(string $code)
    {
        $this->code = $code;
    }

   
    public function build()
    {
        return $this->subject('Your Dr.-Fix Verification Code')
            ->view('emails.otp')
            ->with(['code' => $this->code]);
    }
}
