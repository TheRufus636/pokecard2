import { useState, useEffect } from 'react';
import { api } from './api.js';
import { fetchPokemon } from './pokeapi.js';

function DeckCard({ deckEntry, onVote }) {
    const [pokemons, setPokemons] = useState({});

    useEffect(() => {
        deckEntry.deck.forEach(({ pokemon_id }) => {
            if (!pokemon_id) return;
            fetchPokemon(pokemon_id).then(p => {
                if (p) setPokemons(prev => ({ ...prev, [pokemon_id]: p }));
            });
        });
    }, [deckEntry]);

    const { owner_name, deck, likes, dislikes, my_vote, owner_id } = deckEntry;

    // Color del primer pokémon del mazo como acento
    const firstId = deck[0]?.pokemon_id;
    const firstPkm = firstId ? pokemons[firstId] : null;
    const accentColor = firstPkm?.types[0]?.color || '#7c3aed';

    return (
        <div
            className="bg-zinc-900 rounded-2xl border border-zinc-700 overflow-hidden hover:border-zinc-500 transition-colors"
            style={{ borderTopColor: accentColor, borderTopWidth: 3 }}
        >
            {/* Header */}
            <div className="px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-sm"
                        style={{ background: accentColor }}
                    >
                        {owner_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="text-white font-bold text-sm">{owner_name}</p>
                        <p className="text-zinc-500 text-xs">{deck.length} cartas en el mazo</p>
                    </div>
                </div>
            </div>

            {/* Mini cartas del mazo */}
            <div className="px-5 pb-4">
                <div className="flex gap-2 flex-wrap">
                    {Array.from({ length: 6 }, (_, i) => {
                        const slot = deck.find(d => d.slot === i);
                        const id   = slot?.pokemon_id;
                        const p    = id ? pokemons[id] : null;
                        const mc   = p?.types[0]?.color || '#333';

                        return (
                            <div
                                key={i}
                                className="w-14 h-18 rounded-xl flex flex-col items-center py-1.5 px-1 border"
                                style={{
                                    background: p ? `linear-gradient(145deg, ${mc}55, ${mc}22)` : '#27272a',
                                    borderColor: p ? mc + '66' : '#3f3f46',
                                }}
                            >
                                {p ? (
                                    <>
                                        <img src={p.sprite} alt={p.name} className="w-9 h-9 object-contain" />
                                        <p className="text-white text-xs font-bold truncate w-full text-center mt-0.5" style={{ fontSize: 9 }}>
                                            {p.name}
                                        </p>
                                    </>
                                ) : id ? (
                                    <div className="w-9 h-9 rounded-full bg-zinc-700 animate-pulse mt-1" />
                                ) : (
                                    <div className="text-zinc-700 text-xl mt-2">·</div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Botones de voto */}
            <div className="px-5 py-3 border-t border-zinc-800 flex items-center gap-3">
                <button
                    onClick={() => onVote(owner_id, 'like')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                        my_vote === 'like'
                            ? 'bg-green-600 text-white'
                            : 'bg-zinc-800 text-zinc-300 hover:bg-green-900/40 hover:text-green-400'
                    }`}
                >
                    👍 {likes}
                </button>
                <button
                    onClick={() => onVote(owner_id, 'dislike')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                        my_vote === 'dislike'
                            ? 'bg-red-700 text-white'
                            : 'bg-zinc-800 text-zinc-300 hover:bg-red-900/40 hover:text-red-400'
                    }`}
                >
                    👎 {dislikes}
                </button>
            </div>
        </div>
    );
}

export default function Social() {
    const [decks, setDecks]   = useState([]);
    const [order, setOrder]   = useState('likes');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        api.getSocial(order).then(data => {
            setDecks(data.decks);
            setLoading(false);
        });
    }, [order]);

    async function handleVote(ownerId, voteType) {
        try {
            const data = await api.vote(ownerId, voteType);
            setDecks(prev => prev.map(d =>
                d.owner_id === ownerId
                    ? { ...d, likes: data.likes, dislikes: data.dislikes, my_vote: data.my_vote }
                    : d
            ));
        } catch {}
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white">🌍 Social</h1>
                    <p className="text-zinc-400 mt-1">Mazos de otros entrenadores</p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setOrder('likes')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                            order === 'likes' ? 'bg-purple-600 text-white' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                        }`}
                    >
                        🏆 Top
                    </button>
                    <button
                        onClick={() => setOrder('recent')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                            order === 'recent' ? 'bg-purple-600 text-white' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                        }`}
                    >
                        🕐 Recientes
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <img src="/img/pokeball.gif" className="w-12 h-12 animate-spin opacity-50" />
                </div>
            ) : decks.length === 0 ? (
                <div className="text-center py-20 text-zinc-500">
                    <p className="text-2xl mb-2">😴</p>
                    <p className="text-lg font-bold text-zinc-400">No hay mazos publicados aún</p>
                    <p className="text-sm mt-1">¡Crea y guarda tu mazo para que aparezca aquí!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {decks.map(deck => (
                        <DeckCard key={deck.owner_id} deckEntry={deck} onVote={handleVote} />
                    ))}
                </div>
            )}
        </div>
    );
}
