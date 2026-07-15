<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('login');
});

Route::get('/tableau-de-bord', function () {
    return view('index');
});
