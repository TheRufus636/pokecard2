<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CollectionController extends Controller
{
    public function index(Request $request)
    {
        $user  = Auth::user();
        $cards = $user->cards()->get(['pokemon_id', 'quantity']);

        return response()->json(['cards' => $cards]);
    }
}
