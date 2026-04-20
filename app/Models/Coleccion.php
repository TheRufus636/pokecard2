<?php
 
namespace App\Models;
 
use Illuminate\Database\Eloquent\Model;
 
class UserCard extends Model
{
    protected $fillable = ['user_id', 'pokemon_id', 'quantity'];
 
    // Pertenece a un usuario
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
 