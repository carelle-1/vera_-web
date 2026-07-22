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

Route::get('/favoris', function () {
    return view('favoris');
});

Route::get('/parametre', function () {
    return view('parametre');
});

Route::get('/oppotunite', function () {
    return view('oppotunite');
});

Route::get('/candidatures', function () {
    return view('candidature');
});

Route::get('/messages', function () {
    return view('message');
});

Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth');

Route::get('/scrape-jobs', [App\Http\Controllers\ScraperController::class, 'scrapeAll'])->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class);

Route::post('/upload-cv', [App\Http\Controllers\UploadController::class, 'uploadCv'])->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class);
Route::post('/upload-cover-letter', [App\Http\Controllers\UploadController::class, 'uploadCoverLetter'])->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class);
Route::post('/delete-cv', [App\Http\Controllers\UploadController::class, 'deleteCv'])->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class);
Route::post('/delete-cover-letter', [App\Http\Controllers\UploadController::class, 'deleteCoverLetter'])->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class);

Route::get('/test-firebase', function () {
    return response()->json([
        'credentials_exists' => file_exists(base_path('storage/app/firebase/vera-firebase.json')),
        'database_url' => env('FIREBASE_DATABASE_URL'),
        'storage_bucket' => env('FIREBASE_STORAGE_DEFAULT_BUCKET'),
        'credentials_path' => base_path('storage/app/firebase/vera-firebase.json'),
    ]);
});
