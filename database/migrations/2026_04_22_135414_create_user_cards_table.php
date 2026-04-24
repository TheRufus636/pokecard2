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
        Schema::create('user_cards', function (Blueprint $table) {
            $table->id();
            // Relación con el usuario (si borras al usuario, se borran sus cartas)
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            // ID del Pokémon
            $table->integer('pokemon_id');
            // Cantidad de cartas repetidas (empieza en 1)
            $table->integer('quantity')->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_cards');
    }
};