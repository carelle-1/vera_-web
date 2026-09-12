<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HomeText extends Model
{
    protected $fillable = ['key', 'value'];

    public $timestamps = true;
}
