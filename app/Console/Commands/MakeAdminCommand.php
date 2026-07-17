<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class MakeAdminCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:make-admin {email : Email de l\'utilisateur}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Assigner le rôle admin à un utilisateur';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $email = $this->argument('email');

        $user = User::where('email', $email)->first();

        if (!$user) {
            $this->error("Utilisateur avec l'email '{$email}' non trouvé.");
            return 1;
        }

        $user->update(['role' => 'admin']);

        $this->info("✅ L'utilisateur '{$user->name}' ({$email}) a maintenant le rôle admin.");
        return 0;
    }
}
