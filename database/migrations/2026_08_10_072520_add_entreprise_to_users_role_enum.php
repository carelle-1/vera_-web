<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::disableForeignKeyConstraints();

        Schema::create('users_new', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();
            $table->enum('role', ['admin', 'chercheur_emploi', 'entreprise'])->default('chercheur_emploi');
            $table->timestamps();
        });

        $users = DB::table('users')->get();
        foreach ($users as $user) {
            DB::table('users_new')->insert([
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'email_verified_at' => $user->email_verified_at,
                'password' => $user->password,
                'remember_token' => $user->remember_token,
                'role' => $user->role,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
            ]);
        }

        Schema::dropIfExists('users');
        Schema::rename('users_new', 'users');

        Schema::enableForeignKeyConstraints();
    }

    public function down(): void
    {
        Schema::disableForeignKeyConstraints();

        Schema::create('users_old', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();
            $table->enum('role', ['admin', 'chercheur_emploi'])->default('chercheur_emploi');
            $table->timestamps();
        });

        $users = DB::table('users')->get();
        foreach ($users as $user) {
            DB::table('users_old')->insert([
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'email_verified_at' => $user->email_verified_at,
                'password' => $user->password,
                'remember_token' => $user->remember_token,
                'role' => $user->role,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
            ]);
        }

        Schema::dropIfExists('users');
        Schema::rename('users_old', 'users');

        Schema::enableForeignKeyConstraints();
    }
};
