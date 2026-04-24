<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserCard extends Model
{
    protected $table = 'user_cards';

    protected $fillable = ['user_id', 'pokemon_id', 'quantity'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
