<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CollectionController;
use App\Http\Controllers\DeckController;
use App\Http\Controllers\ShopController;
use App\Http\Controllers\SocialController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — PokeCard Collector
|--------------------------------------------------------------------------
|
| Todas las rutas usan el prefijo /api automáticamente (configurado en
| bootstrap/app.php). Las rutas protegidas usan el middleware 'auth:web'
| que comprueba la sesión activa.
|
*/

// ─── Rutas PÚBLICAS (sin autenticación) ──────────────────────────────────────
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// ─── Rutas PROTEGIDAS (requieren sesión activa) ───────────────────────────────
Route::middleware('auth:web')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);      // datos del usuario actual

    // Tienda
    Route::post('/shop/buy',    [ShopController::class, 'buyPack']);     // comprar sobre
    Route::post('/shop/reload', [ShopController::class, 'reloadCoins']); // recargar monedas

    // Colección (Pokédex)
    Route::get('/collection', [CollectionController::class, 'index']); // ver mis cartas

    // Mazo de batalla
    Route::get('/deck',  [DeckController::class, 'index']); // ver mi mazo
    Route::post('/deck', [DeckController::class, 'save']);  // guardar mi mazo

    // Social
    Route::get('/social',               [SocialController::class, 'index']); // ver mazos públicos
    Route::post('/social/{owner}/vote', [SocialController::class, 'vote']);  // votar mazo
});