<?php

namespace App\Http\Controllers;

use App\Models\UserCard;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ShopController extends Controller
{
    // Precios y cartas por sobre
    private const PACKS = [
        'basico'   => ['price' => 50,  'cards' => 5],
        'estandar' => ['price' => 100, 'cards' => 12],
        'premium'  => ['price' => 200, 'cards' => 25],
    ];

    // Rareza de los 151 pokémon: peso de probabilidad
    // Cuanto mayor el número, más común
    private function getRarityWeight(int $id): int
    {
        // Legendarios (muy raros)
        $legendary = [144, 145, 146, 150, 151];
        if (in_array($id, $legendary)) return 1;

        // Semi-legendarios
        $semiLegendary = [131, 132, 143, 138, 139, 140, 141, 142];
        if (in_array($id, $semiLegendary)) return 5;

        // Pokémon iniciales y evoluciones finales
        if ($id <= 9 || ($id >= 152 && $id <= 160)) return 10;

        // Resto: comunes
        return 20;
    }

    public function buyPack(Request $request)
    {
        $request->validate([
            'pack_type' => ['required', 'in:basico,estandar,premium'],
        ]);

        $packType = $request->pack_type;
        $pack     = self::PACKS[$packType];
        $user     = Auth::user();

        if ($user->coins < $pack['price']) {
            return response()->json(['message' => 'Monedas insuficientes'], 422);
        }

        // Construimos pool ponderado de los 151 pokémon
        $pool = [];
        for ($id = 1; $id <= 151; $id++) {
            $weight = $this->getRarityWeight($id);
            for ($w = 0; $w < $weight; $w++) {
                $pool[] = $id;
            }
        }

        // Sacamos N cartas al azar
        $drawn = [];
        for ($i = 0; $i < $pack['cards']; $i++) {
            $drawn[] = $pool[array_rand($pool)];
        }

        DB::transaction(function () use ($user, $pack, $drawn) {
            // Descontar monedas
            $user->decrement('coins', $pack['price']);

            // Añadir cartas a la colección
            foreach ($drawn as $pokemonId) {
                $existing = UserCard::where('user_id', $user->id)
                    ->where('pokemon_id', $pokemonId)
                    ->first();

                if ($existing) {
                    $existing->increment('quantity');
                } else {
                    UserCard::create([
                        'user_id'    => $user->id,
                        'pokemon_id' => $pokemonId,
                        'quantity'   => 1,
                    ]);
                }
            }
        });

        $user->refresh();

        return response()->json([
            'drawn_cards' => $drawn,
            'coins'       => $user->coins,
        ]);
    }

    public function reloadCoins(Request $request)
    {
        $user = Auth::user();
        $user->increment('coins', 500);
        $user->refresh();

        return response()->json(['coins' => $user->coins]);
    }
}
