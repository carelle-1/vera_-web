<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

Route::get('/', function () {
    return view('login');
});

Route::get('/login-stats', [App\Http\Controllers\StatsController::class, 'data'])->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class);

// Route de synchronisation Firebase -> Laravel (sans protection d'auth)
Route::post('/sync-firebase-auth', [AuthController::class, 'syncFirebaseAuth'])->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class);

Route::get('/tableau-de-bord', function () {
    return view('index');
});

Route::get('/coaching', function () {
    return view('coach');
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

Route::get('/formations', function () {
    return view('formations');
});

Route::get('/candidatures', function () {
    return view('candidature');
});

Route::get('/formations/data', [App\Http\Controllers\FormationsController::class, 'data'])->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class);

Route::get('/notifications', function () {
    return view('notification');
});

Route::get('/notifications/data', [App\Http\Controllers\NotificationsController::class, 'data'])->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class);

Route::get('/messages', function () {
    return view('message');
});

Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth');

Route::get('/scrape-jobs', [App\Http\Controllers\ScraperController::class, 'scrapeAll'])->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class);

Route::post('/upload-cv', [App\Http\Controllers\UploadController::class, 'uploadCv'])->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class);
Route::post('/upload-cover-letter', [App\Http\Controllers\UploadController::class, 'uploadCoverLetter'])->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class);
Route::post('/delete-cv', [App\Http\Controllers\UploadController::class, 'deleteCv'])->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class);
Route::post('/delete-cover-letter', [App\Http\Controllers\UploadController::class, 'deleteCoverLetter'])->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class);
Route::post('/messages/upload', [App\Http\Controllers\UploadController::class, 'uploadMessageFile'])->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class);
Route::post('/messages/send', [App\Http\Controllers\ChatController::class, 'send'])->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class);
Route::post('/coaching/advice', [App\Http\Controllers\CoachController::class, 'advice'])->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class);
Route::post('/send-application-email', [App\Http\Controllers\ApplyEmailController::class, 'send'])->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class);

Route::get('/test-firebase', function () {
    return response()->json([
        'credentials_exists' => file_exists(base_path('storage/app/firebase/vera-firebase.json')),
        'database_url' => env('FIREBASE_DATABASE_URL'),
        'storage_bucket' => env('FIREBASE_STORAGE_DEFAULT_BUCKET'),
        'credentials_path' => base_path('storage/app/firebase/vera-firebase.json'),
    ]);
});
