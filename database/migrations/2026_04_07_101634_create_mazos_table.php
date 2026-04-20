<?php
 
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
 
return new class extends Migration
{
    public function up(): void
    {
        // Votos sociales: like o dislike a mazos de otros usuarios
        // vote_type: 'like' o 'dislike'
        Schema::create('deck_votes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('voter_id')->constrained('users')->onDelete('cascade');   // quien vota
            $table->foreignId('owner_id')->constrained('users')->onDelete('cascade');   // dueño del mazo
            $table->enum('vote_type', ['like', 'dislike']);
            $table->timestamps();
 
            // Un usuario solo puede tener un voto por mazo de otro usuario
            $table->unique(['voter_id', 'owner_id']);
        });
    }
 
    public function down(): void
    {
        Schema::dropIfExists('deck_votes');
    }
};
 