<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ApplyMail extends Mailable
{
    use Queueable, SerializesModels;

    public $userName;
    public $jobTitle;
    public $company;
    public $applyEmail;
    public $cvPath;
    public $coverLetterPath;

    public function __construct($userName, $jobTitle, $company, $applyEmail, $cvPath, $coverLetterPath)
    {
        $this->userName = $userName;
        $this->jobTitle = $jobTitle;
        $this->company = $company;
        $this->applyEmail = $applyEmail;
        $this->cvPath = $cvPath;
        $this->coverLetterPath = $coverLetterPath;
    }

    public function build()
    {
        $email = $this->subject('Candidature de ' . $this->userName . ' - ' . $this->jobTitle)
            ->view('emails.apply')
            ->from(config('mail.from.address'), config('mail.from.name'))
            ->to($this->applyEmail);

        if ($this->cvPath && file_exists($this->cvPath)) {
            $email->attach($this->cvPath, [
                'as' => basename($this->cvPath),
                'mime' => 'application/pdf',
            ]);
        }

        if ($this->coverLetterPath && file_exists($this->coverLetterPath)) {
            $email->attach($this->coverLetterPath, [
                'as' => basename($this->coverLetterPath),
                'mime' => 'application/pdf',
            ]);
        }

        return $email;
    }
}
