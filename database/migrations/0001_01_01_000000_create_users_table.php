<?php
 
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
 
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');          // nombre de usuario
            $table->string('email')->unique();
            $table->string('password');
            $table->integer('coins')->default(500); // saldo inicial: 500 monedas
            $table->timestamps();
        });
    }
 
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
 