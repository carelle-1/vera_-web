<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class RemoveAdminCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:remove-admin {email : Email de l\'utilisateur}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Révoquer le rôle admin d\'un utilisateur';

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

        if ($user->role !== 'admin') {
            $this->warn("L'utilisateur '{$user->name}' n'a pas le rôle admin.");
            return 0;
        }

        $user->update(['role' => 'chercheur_emploi']);

        $this->info("✅ L'utilisateur '{$user->name}' ({$email}) n'a plus le rôle admin.");
        return 0;
    }
}
