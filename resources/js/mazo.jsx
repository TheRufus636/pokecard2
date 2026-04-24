import { useState, useEffect } from 'react';
import { api } from './api.js';
import { fetchPokemon } from './pokeapi.js';

const SLOT_COUNT = 6;

export default function Mazo({ user }) {
    const [collection, setCollection] = useState({});   // { pokemon_id: quantity }
    const [pokemons, setPokemons]     = useState({});   // { id: pokemonData }
    const [deck, setDeck]             = useState(Array(SLOT_COUNT).fill(null)); // [pokemonId|null x6]
    const [search, setSearch]         = useState('');
    const [saving, setSaving]         = useState(false);
    const [saved, setSaved]           = useState(false);
    const [draggedPkm, setDraggedPkm] = useState(null); // id being dragged from collection
    const [draggedSlot, setDraggedSlot] = useState(null); // slot index being dragged

    // Carga colección y mazo actual
    useEffect(() => {
        Promise.all([api.getCollection(), api.getDeck()]).then(([colData, deckData]) => {
            const map = {};
            colData.cards.forEach(c => { map[c.pokemon_id] = c.quantity; });
            setCollection(map);

            const newDeck = Array(SLOT_COUNT).fill(null);
            deckData.deck.forEach(s => { newDeck[s.slot] = s.pokemon_id; });
            setDeck(newDeck);

            // Cargar datos de los pokemon de la colección + los del mazo
            const ids = [...Object.keys(map).map(Number), ...newDeck.filter(Boolean)];
            const uniqueIds = [...new Set(ids)];
            uniqueIds.forEach(id => {
                fetchPokemon(id).then(p => {
                    if (p) setPokemons(prev => ({ ...prev, [id]: p }));
                });
            });
        });
    }, []);

    // IDs en el mazo actual
    const deckSet = new Set(deck.filter(Boolean));

    // Colección filtrada (excluye los que ya están en el mazo)
    const filteredCollection = Object.keys(collection)
        .map(Number)
        .filter(id => {
            if (deckSet.has(id)) return false;
            const p = pokemons[id];
            if (!p) return true;
            return !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.number.includes(search);
        });

    function addToSlot(pokemonId) {
        const freeSlot = deck.findIndex(s => s === null);
        if (freeSlot === -1) return; // mazo lleno
        const newDeck = [...deck];
        newDeck[freeSlot] = pokemonId;
        setDeck(newDeck);
    }

    function removeFromSlot(slotIndex) {
        const newDeck = [...deck];
        newDeck[slotIndex] = null;
        setDeck(newDeck);
    }

    // Drag desde colección
    function onDragStartCollection(id) { setDraggedPkm(id); setDraggedSlot(null); }
    // Drag desde slot del mazo
    function onDragStartSlot(slotIdx)  { setDraggedSlot(slotIdx); setDraggedPkm(null); }

    function onDropSlot(targetSlot) {
        const newDeck = [...deck];
        if (draggedPkm !== null) {
            // Viene de la colección
            newDeck[targetSlot] = draggedPkm;
        } else if (draggedSlot !== null) {
            // Intercambio entre slots
            const tmp = newDeck[targetSlot];
            newDeck[targetSlot] = newDeck[draggedSlot];
            newDeck[draggedSlot] = tmp;
        }
        setDeck(newDeck);
        setDraggedPkm(null);
        setDraggedSlot(null);
    }

    function onDropCollection() {
        // Soltar sobre la colección = quitar del mazo
        if (draggedSlot !== null) removeFromSlot(draggedSlot);
        setDraggedPkm(null);
        setDraggedSlot(null);
    }

    async function guardarMazo() {
        setSaving(true);
        try {
            const payload = deck.map((pokemonId, slot) => ({ slot, pokemon_id: pokemonId }));
            await api.saveDeck(payload);
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch {}
        setSaving(false);
    }

    function SlotCard({ slotIndex }) {
        const id = deck[slotIndex];
        const p  = id ? pokemons[id] : null;
        const mainColor = p?.types[0]?.color || '#444';

        return (
            <div
                className="relative rounded-xl border-2 transition-all select-none"
                style={{
                    borderColor: id ? mainColor + '99' : '#3f3f46',
                    minHeight: 120,
                    background: id ? `linear-gradient(145deg, ${mainColor}44, ${mainColor}22)` : '#27272a',
                    cursor: id ? 'grab' : 'default',
                }}
                draggable={!!id}
                onDragStart={() => id && onDragStartSlot(slotIndex)}
                onDragOver={e => e.preventDefault()}
                onDrop={() => onDropSlot(slotIndex)}
            >
                {id && p ? (
                    <>
                        <button
                            onClick={() => removeFromSlot(slotIndex)}
                            className="absolute top-1 right-1 text-white/40 hover:text-red-400 text-sm z-10"
                        >✕</button>
                        <div className="flex flex-col items-center p-3 pt-2">
                            <p className="text-zinc-400 text-xs font-mono">#{p.number}</p>
                            <img src={p.sprite} alt={p.name} className="w-14 h-14 object-contain drop-shadow" />
                            <p className="text-white text-xs font-bold mt-1 text-center">{p.name}</p>
                            <div className="flex gap-1 mt-1">
                                {p.types.map(t => (
                                    <span key={t.key} style={{ background: t.color }}
                                          className="text-white text-xs rounded-full px-1.5 py-0.5 text-[9px] font-bold">
                                        {t.label}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </>
                ) : id ? (
                    <div className="flex items-center justify-center h-28 text-zinc-500 text-xs">Cargando...</div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-28 gap-1">
                        <div className="text-zinc-600 text-2xl">+</div>
                        <p className="text-zinc-600 text-xs">Slot {slotIndex + 1}</p>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 flex gap-6 flex-col lg:flex-row">
            {/* Panel izquierdo: mazo */}
            <div className="lg:w-80 flex-shrink-0">
                <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 sticky top-20">
                    <h2 className="text-xl font-black text-white mb-1">⚔️ Mi Mazo</h2>
                    <p className="text-zinc-400 text-sm mb-4">
                        {deck.filter(Boolean).length}/{SLOT_COUNT} cartas
                    </p>

                    <div className="grid grid-cols-2 gap-3 mb-5">
                        {Array.from({ length: SLOT_COUNT }, (_, i) => (
                            <SlotCard key={i} slotIndex={i} />
                        ))}
                    </div>

                    <button
                        onClick={guardarMazo}
                        disabled={saving}
                        className={`w-full font-bold py-3 rounded-xl transition-all ${
                            saved
                                ? 'bg-green-600 text-white'
                                : 'bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50'
                        }`}
                    >
                        {saving ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar Mazo'}
                    </button>
                </div>
            </div>

            {/* Panel derecho: colección */}
            <div
                className="flex-1"
                onDragOver={e => e.preventDefault()}
                onDrop={onDropCollection}
            >
                <div className="mb-4 flex gap-3 items-center">
                    <h2 className="text-xl font-black text-white">🃏 Tu Colección</h2>
                    <span className="text-zinc-400 text-sm">({filteredCollection.length} disponibles)</span>
                </div>

                <input
                    type="text"
                    placeholder="🔍 Buscar pokémon..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full mb-4 bg-zinc-700 border border-zinc-600 rounded-xl px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 text-sm"
                />

                <p className="text-zinc-500 text-xs mb-3">
                    Arrastra un Pokémon a un slot del mazo, o haz doble clic para añadirlo automáticamente.
                </p>

                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-2">
                    {filteredCollection.map(id => {
                        const p = pokemons[id];
                        const mainColor = p?.types[0]?.color || '#555';
                        return (
                            <div
                                key={id}
                                draggable
                                onDragStart={() => onDragStartCollection(id)}
                                onDoubleClick={() => {
                                    if (deck.filter(Boolean).length < SLOT_COUNT) addToSlot(id);
                                }}
                                className="rounded-xl border-2 cursor-grab hover:-translate-y-0.5 transition-transform select-none"
                                style={{
                                    borderColor: p ? mainColor + '77' : '#3f3f46',
                                    background: p ? `linear-gradient(145deg, ${mainColor}44, ${mainColor}22)` : '#27272a',
                                }}
                            >
                                {p ? (
                                    <div className="flex flex-col items-center p-2">
                                        <p className="text-zinc-400 text-xs font-mono">#{p.number}</p>
                                        <img src={p.sprite} alt={p.name} className="w-12 h-12 object-contain" />
                                        <p className="text-white text-xs font-bold text-center mt-1 truncate w-full text-center">{p.name}</p>
                                        {collection[id] > 1 && (
                                            <span className="text-yellow-400 text-xs">×{collection[id]}</span>
                                        )}
                                    </div>
                                ) : (
                                    <div className="h-20 flex items-center justify-center">
                                        <div className="w-4 h-4 rounded-full bg-zinc-600 animate-pulse" />
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {filteredCollection.length === 0 && (
                        <div className="col-span-full text-center py-12 text-zinc-500">
                            <p className="text-lg">Sin cartas disponibles</p>
                            <p className="text-sm mt-1">Compra sobres en la tienda para obtener más Pokémon</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
