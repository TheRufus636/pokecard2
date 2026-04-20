<?php
 
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
 
return new class extends Migration
{
    public function up(): void
    {
        // Colección de cartas del usuario
        // pokemon_id va del 1 al 151 (IDs de la PokeAPI)
        // quantity indica cuántas copias tiene el usuario de ese Pokémon
        Schema::create('user_cards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->integer('pokemon_id'); // ID del Pokémon (1-151)
            $table->integer('quantity')->default(1);
            $table->timestamps();
 
            // Un usuario no puede tener duplicados en esta tabla,
            // la cantidad se suma en el campo quantity
            $table->unique(['user_id', 'pokemon_id']);
        });
    }
 
    public function down(): void
    {
        Schema::dropIfExists('user_cards');
    }
};