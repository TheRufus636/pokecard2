<?php
 
namespace App\Models;
 
use Illuminate\Database\Eloquent\Model;
 
class DeckSlot extends Model
{
    protected $fillable = ['user_id', 'slot', 'pokemon_id'];
 
    protected $casts = [
        'pokemon_id' => 'integer',
        'slot'       => 'integer',
    ];
 
    // Pertenece a un usuario
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
 