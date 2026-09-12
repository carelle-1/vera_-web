<?php

namespace App\Http\Controllers;

use App\Models\HomeText;
use Illuminate\Http\Request;

class HomeTextController extends Controller
{
    public function index()
    {
        $texts = HomeText::all()->pluck('value', 'key');
        return response()->json($texts);
    }
}
