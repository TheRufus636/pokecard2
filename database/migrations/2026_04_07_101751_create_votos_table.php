<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('votos', function (Blueprint $table) {
        $table->id();
        
        // El usuario que emite el voto
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        
        // El mazo que recibe el voto
        $table->foreignId('mazo_id')->constrained()->onDelete('cascade');
        
        // El tipo de voto: true = Like, false = Dislike
        $table->boolean('es_like');
        
        $table->timestamps();

        // REGLA DE ORO: Un usuario solo puede tener un voto por mazo
        $table->unique(['user_id', 'mazo_id']);
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('votos');
    }
};
