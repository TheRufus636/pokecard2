<?php

namespace App\Http\Controllers;

use App\Models\DeckSlot;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DeckController extends Controller
{
    public function index(Request $request)
    {
        $user  = Auth::user();
        $slots = $user->deckSlots()->get(['slot', 'pokemon_id']);

        return response()->json(['deck' => $slots]);
    }

    public function save(Request $request)
    {
        $request->validate([
            'deck'            => ['required', 'array', 'size:6'],
            'deck.*.slot'     => ['required', 'integer', 'min:0', 'max:5'],
            'deck.*.pokemon_id' => ['nullable', 'integer', 'min:1', 'max:151'],
        ]);

        $user = Auth::user();

        DB::transaction(function () use ($user, $request) {
            // Borramos slots existentes
            DeckSlot::where('user_id', $user->id)->delete();

            // Insertamos los nuevos
            foreach ($request->deck as $slotData) {
                DeckSlot::create([
                    'user_id'    => $user->id,
                    'slot'       => $slotData['slot'],
                    'pokemon_id' => $slotData['pokemon_id'] ?? null,
                ]);
            }
        });

        return response()->json(['message' => 'Mazo guardado']);
    }
}
