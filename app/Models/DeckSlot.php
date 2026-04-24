<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeckSlot extends Model
{
    protected $table = 'deck_slots';

    protected $fillable = ['user_id', 'slot', 'pokemon_id'];

    protected $casts = [
        'pokemon_id' => 'integer',
        'slot'       => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
