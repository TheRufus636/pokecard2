<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeckVote extends Model
{
    protected $fillable = ['voter_id', 'owner_id', 'vote_type'];

    // El usuario que votó
    public function voter()
    {
        return $this->belongsTo(User::class, 'voter_id');
    }

    // El dueño del mazo votado
    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }
}