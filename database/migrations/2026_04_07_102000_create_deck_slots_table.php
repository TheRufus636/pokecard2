<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('deck_slots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->unsignedTinyInteger('slot'); // 0-5
            $table->integer('pokemon_id')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'slot']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deck_slots');
    }
};
