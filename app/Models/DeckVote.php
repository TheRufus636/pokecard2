<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeckVote extends Model
{
    protected $table = 'deck_votes';

    protected $fillable = ['voter_id', 'owner_id', 'vote_type'];

    public function voter()
    {
        return $this->belongsTo(User::class, 'voter_id');
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }
}
