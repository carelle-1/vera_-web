<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

Route::get('/', function () {
    return view('login');
});

// Route de synchronisation Firebase -> Laravel (sans protection d'auth)
Route::post('/sync-firebase-auth', [AuthController::class, 'syncFirebaseAuth'])->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class);

Route::get('/tableau-de-bord', function () {
    return view('index');
});

Route::get('/profil', function () {
    return view('profil');
});

Route::get('/admin', function () {
    return view('admin');
});

Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth');
