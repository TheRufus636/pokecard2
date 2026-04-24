<?php

namespace App\Http\Controllers;

use App\Models\DeckSlot;
use App\Models\DeckVote;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SocialController extends Controller
{
    public function index(Request $request)
    {
        $currentUserId = Auth::id();
        $orderBy       = $request->get('order', 'likes');

        $usersWithDecks = User::where('id', '!=', $currentUserId)
            ->whereHas('deckSlots', function ($query) {
                $query->whereNotNull('pokemon_id');
            })
            ->with(['deckSlots' => function ($query) {
                $query->whereNotNull('pokemon_id')->orderBy('slot');
            }])
            ->get();

        $decks = $usersWithDecks->map(function (User $user) use ($currentUserId) {
            $likes    = DeckVote::where('owner_id', $user->id)->where('vote_type', 'like')->count();
            $dislikes = DeckVote::where('owner_id', $user->id)->where('vote_type', 'dislike')->count();
            $myVote   = DeckVote::where('voter_id', $currentUserId)->where('owner_id', $user->id)->first();

            return [
                'owner_id'   => $user->id,
                'owner_name' => $user->name,
                'deck'       => $user->deckSlots->map(fn($slot) => [
                    'slot'       => $slot->slot,
                    'pokemon_id' => $slot->pokemon_id,
                ]),
                'likes'    => $likes,
                'dislikes' => $dislikes,
                'my_vote'  => $myVote ? $myVote->vote_type : null,
            ];
        });

        if ($orderBy === 'recent') {
            $decks = $decks->sortByDesc('owner_id')->values();
        } else {
            $decks = $decks->sortByDesc('likes')->values();
        }

        return response()->json(['decks' => $decks]);
    }

    public function vote(Request $request, $ownerId)
    {
        $request->validate([
            'vote_type' => 'required|in:like,dislike',
        ]);

        $voterId = Auth::id();

        if ($voterId == $ownerId) {
            return response()->json(['message' => 'No puedes votar tu propio mazo.'], 403);
        }

        User::findOrFail($ownerId);

        $existingVote = DeckVote::where('voter_id', $voterId)->where('owner_id', $ownerId)->first();

        if ($existingVote) {
            if ($existingVote->vote_type === $request->vote_type) {
                $existingVote->delete();
                $action = 'removed';
            } else {
                $existingVote->vote_type = $request->vote_type;
                $existingVote->save();
                $action = 'changed';
            }
        } else {
            DeckVote::create([
                'voter_id'  => $voterId,
                'owner_id'  => $ownerId,
                'vote_type' => $request->vote_type,
            ]);
            $action = 'created';
        }

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
