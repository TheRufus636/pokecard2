<?php
 
namespace App\Http\Controllers;
 
use App\Models\DeckSlot;
use App\Models\DeckVote;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
 
class SocialController extends Controller
{
    /**
     * LISTA DE MAZOS PÚBLICOS: devuelve los mazos de todos los usuarios
     * excepto el del usuario autenticado. Solo muestra mazos con al menos 1 carta.
     *
     * Cada mazo incluye: nombre del usuario, las cartas, likes, dislikes
     * y el voto del usuario actual (si lo tiene).
     */
    public function index(Request $request)
    {
        $currentUserId = Auth::id();
        $orderBy       = $request->get('order', 'likes'); // 'likes' o 'recent'
 
        // Buscamos todos los usuarios (excepto el actual) que tienen al menos 1 carta en el mazo
        $usersWithDecks = User::where('id', '!=', $currentUserId)
            ->whereHas('deckSlots', function ($query) {
                $query->whereNotNull('pokemon_id'); // al menos un slot con Pokémon
            })
            ->with(['deckSlots' => function ($query) {
                $query->whereNotNull('pokemon_id')->orderBy('slot');
            }])
            ->get();
 
        // Construimos la respuesta con votos incluidos
        $decks = $usersWithDecks->map(function (User $user) use ($currentUserId) {
            // Contamos likes y dislikes de este mazo
            $likes    = DeckVote::where('owner_id', $user->id)->where('vote_type', 'like')->count();
            $dislikes = DeckVote::where('owner_id', $user->id)->where('vote_type', 'dislike')->count();
 
            // Voto del usuario actual en este mazo (null si no ha votado)
            $myVote = DeckVote::where('voter_id', $currentUserId)
                               ->where('owner_id', $user->id)
                               ->first();
 
            return [
                'owner_id'   => $user->id,
                'owner_name' => $user->name,
                'deck'       => $user->deckSlots->map(fn($slot) => [
                    'slot'       => $slot->slot,
                    'pokemon_id' => $slot->pokemon_id,
                ]),
                'likes'      => $likes,
                'dislikes'   => $dislikes,
                'my_vote'    => $myVote ? $myVote->vote_type : null, // 'like', 'dislike' o null
            ];
        });
 
        // Ordenamos según el parámetro recibido
        if ($orderBy === 'recent') {
            // Ordenamos por la última actualización del mazo
            $decks = $decks->sortByDesc(fn($d) => $d['owner_id'])->values();
        } else {
            // Por defecto: más likes primero
            $decks = $decks->sortByDesc('likes')->values();
        }
 
        return response()->json(['decks' => $decks]);
    }
 
    /**
     * VOTAR: dar like o dislike a un mazo.
     *
     * Reglas:
     * - No puedes votar tu propio mazo
     * - Si votas el mismo tipo que ya tenías → se elimina el voto
     * - Si votas el tipo contrario → se cambia el voto
     */
    public function vote(Request $request, $ownerId)
    {
        $request->validate([
            'vote_type' => 'required|in:like,dislike',
        ]);
 
        $voterId = Auth::id();
 
        // No puedes votar tu propio mazo
        if ($voterId == $ownerId) {
            return response()->json(['message' => 'No puedes votar tu propio mazo.'], 403);
        }
 
        // Comprobamos que el dueño existe
        $owner = User::findOrFail($ownerId);
 
        // Buscamos si ya existe un voto de este usuario a este mazo
        $existingVote = DeckVote::where('voter_id', $voterId)
                                 ->where('owner_id', $ownerId)
                                 ->first();
 
        if ($existingVote) {
            if ($existingVote->vote_type === $request->vote_type) {
                // Mismo voto → lo eliminamos (toggle off)
                $existingVote->delete();
                $action = 'removed';
            } else {
                // Voto contrario → cambiamos el tipo
                $existingVote->vote_type = $request->vote_type;
                $existingVote->save();
                $action = 'changed';
            }
        } else {
            // Voto nuevo
            DeckVote::create([
                'voter_id'  => $voterId,
                'owner_id'  => $ownerId,
                'vote_type' => $request->vote_type,
            ]);
            $action = 'created';
        }
 
        // Devolvemos los conteos actualizados
        $likes    = DeckVote::where('owner_id', $ownerId)->where('vote_type', 'like')->count();
        $dislikes = DeckVote::where('owner_id', $ownerId)->where('vote_type', 'dislike')->count();
        $myVote   = DeckVote::where('voter_id', $voterId)->where('owner_id', $ownerId)->first();
 
        return response()->json([
            'action'   => $action,
            'likes'    => $likes,
            'dislikes' => $dislikes,
            'my_vote'  => $myVote ? $myVote->vote_type : null,
        ]);
    }
}