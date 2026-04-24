<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'coins',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'password' => 'hashed',
        'coins'    => 'integer',
    ];

    // Un usuario tiene muchas cartas en su colección
    public function cards()
    {
        return $this->hasMany(UserCard::class);
    }

    // Un usuario tiene 6 slots de mazo
    public function deckSlots()
    {
        return $this->hasMany(DeckSlot::class)->orderBy('slot');
    }

    // Votos que este usuario ha dado a otros mazos
    public function votesGiven()
    {
        return $this->hasMany(DeckVote::class, 'voter_id');
    }

    // Votos que ha recibido el mazo de este usuario
    public function votesReceived()
    {
        return $this->hasMany(DeckVote::class, 'owner_id');
    }
}
