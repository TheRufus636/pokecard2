<?php

use Illuminate\Support\Facades\Route;

// La raíz redirige al login si no estás autenticado
Route::get('/', function () {
    return view('welcome'); // Aquí cargaremos React
});

// En un proyecto real, usarías controladores, pero para empezar:
Route::get('/login', function () { return view('welcome'); });
Route::get('/register', function () { return view('welcome'); });
Route::get('/tienda', function () { return view('welcome'); });
