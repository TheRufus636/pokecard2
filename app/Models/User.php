<?php
 
namespace App\Models;
 
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
 
class User extends Authenticatable
{
    use Notifiable;
 
    // Campos que se pueden asignar masivamente
    protected $fillable = [
        'name',
        'email',
        'password',
        'coins',
    ];
 
    // Campos ocultos al convertir a JSON (nunca enviamos la contraseña al frontend)
    protected $hidden = [
        'password',
        'remember_token',
    ];
 
    // Casting automático de tipos
    protected $casts = [
        'password' => 'hashed', // Laravel hashea automáticamente al asignar
        'coins'    => 'integer',
    ];
 
    // Relación: un usuario tiene muchas cartas en su colección
    public function cards()
    {
        return $this->hasMany(UserCard::class);
    }
 
    // Relación: un usuario tiene 6 slots de mazo
    public function deckSlots()
    {
        return $this->hasMany(DeckSlot::class)->orderBy('slot');
    }
 
    // Relación: votos que este usuario ha dado a otros mazos
    public function votesGiven()
    {
        return $this->hasMany(DeckVote::class, 'voter_id');
    }
 
    // Relación: votos que ha recibido el mazo de este usuario
    public function votesReceived()
    {
        return $this->hasMany(DeckVote::class, 'owner_id');
    }
}
 