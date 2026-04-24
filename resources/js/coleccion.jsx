import { useState, useEffect, useMemo } from 'react';
import { api } from './api.js';
import { fetchPokemon, TYPE_COLORS, TYPE_LABELS } from './pokeapi.js';

const TYPES = [
    'fire','water','grass','electric','psychic','normal',
    'fighting','poison','ground','flying','bug','rock',
    'ghost','dragon','dark','steel','ice','fairy',
];

function PokemonModal({ pokemon, quantity, onClose }) {
    const mainColor = pokemon.types[0]?.color || '#555';
    const secColor  = pokemon.types[1]?.color || mainColor;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4" onClick={onClose}>
            <div
                className="relative max-w-sm w-full rounded-2xl overflow-hidden shadow-2xl"
                style={{ background: `linear-gradient(135deg, ${mainColor}dd, ${secColor}bb)` }}
                onClick={e => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-3 right-3 text-white/70 hover:text-white text-xl z-10">✕</button>

                <div className="p-6">
                    <div className="flex justify-center">
                        <img src={pokemon.sprite} alt={pokemon.name} className="w-36 h-36 object-contain drop-shadow-2xl" />
                    </div>

                    <div className="text-center mt-2">
                        <p className="text-white/60 text-sm font-mono">#{pokemon.number}</p>
                        <h2 className="text-2xl font-bold text-white">{pokemon.name}</h2>
                        <div className="flex justify-center gap-2 mt-2">
                            {pokemon.types.map(t => (
                                <span key={t.key} style={{ backgroundColor: t.color }}
                                      className="text-white text-xs font-medium rounded-full px-3 py-1">
                                    {t.label}
                                </span>
                            ))}
                        </div>
                        <p style={{ color: pokemon.rarityColor }} className="text-sm font-bold mt-1">✨ {pokemon.rarityLabel}</p>
                        {quantity > 1 && (
                            <p className="text-white/60 text-xs mt-1">×{quantity} copias</p>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="mt-4 space-y-2">
                        {[
                            { label: 'HP',       value: pokemon.hp,      max: 255, emoji: '❤️' },
                            { label: 'Ataque',   value: pokemon.attack,  max: 180, emoji: '⚔️' },
                            { label: 'Defensa',  value: pokemon.defense, max: 180, emoji: '🛡️' },
                            { label: 'Velocidad',value: pokemon.speed,   max: 180, emoji: '💨' },
                        ].map(stat => (
                            <div key={stat.label} className="flex items-center gap-2">
                                <span className="text-xs w-20 text-white/80">{stat.emoji} {stat.label}</span>
                                <div className="flex-1 h-2 bg-black/30 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-white/80 rounded-full transition-all duration-700"
                                        style={{ width: `${(stat.value / stat.max) * 100}%` }}
                                    />
                                </div>
                                <span className="text-xs text-white/80 w-8 text-right">{stat.value}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-white/80">
                        <div className="bg-black/20 rounded-lg p-2 text-center">
                            <p className="text-xs text-white/50">Altura</p>
                            <p className="font-bold">{pokemon.height} m</p>
                        </div>
                        <div className="bg-black/20 rounded-lg p-2 text-center">
                            <p className="text-xs text-white/50">Peso</p>
                            <p className="font-bold">{pokemon.weight} kg</p>
                        </div>
                    </div>

                    <p className="mt-4 text-white/80 text-xs leading-relaxed italic">"{pokemon.description}"</p>

                    <div className="mt-3 flex gap-2 flex-wrap">
                        {pokemon.moves.map(m => (
                            <span key={m} className="bg-black/30 text-white/70 text-xs rounded-lg px-2 py-1 capitalize">
                                ⚡ {m}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function CardMini({ pokemon, owned, quantity, onClick }) {
    const mainColor = pokemon?.types[0]?.color || '#333';

    if (!pokemon) {
        return (
            <div className="w-full aspect-[2/3] rounded-xl bg-zinc-700/40 border border-zinc-600/30 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-zinc-600 animate-pulse" />
            </div>
        );
    }

    return (
        <div
            onClick={onClick}
            className={`relative w-full rounded-xl overflow-hidden transition-transform border-2 select-none
                ${owned ? 'cursor-pointer hover:-translate-y-1 hover:shadow-lg' : 'opacity-30 grayscale cursor-default'}`}
            style={{ border: `2px solid ${owned ? mainColor + '88' : '#333'}` }}
        >
            <div
                className="flex flex-col items-center p-3 sm:p-4 h-full justify-center"
                style={{ background: owned ? `linear-gradient(160deg, ${mainColor}55, ${mainColor}22)` : '#1f1f1f' }}
            >
                <p className="absolute top-2 left-2 text-zinc-400 text-xs font-mono">#{pokemon.number}</p>
                
                {owned && quantity > 1 && (
                    <span className="absolute top-2 right-2 bg-black/60 text-yellow-300 text-xs font-bold rounded-full px-2 py-0.5">
                        ×{quantity}
                    </span>
                )}

                <img
                    src={pokemon.sprite}
                    alt={pokemon.name}
                    className="object-contain w-20 h-20 md:w-28 md:h-28 mt-4"
                    style={{ filter: owned ? 'none' : 'brightness(0)' }}
                />
                
                <p className="text-white text-base font-bold text-center mt-3 leading-tight truncate w-full">
                    {pokemon.name}
                </p>
            </div>
        </div>
    );
}

export default function Coleccion() {
    const [owned, setOwned]           = useState({});
    const [pokemons, setPokemons]     = useState({});
    const [search, setSearch]         = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [sortBy, setSortBy]         = useState('id');
    const [sortDir, setSortDir]       = useState('asc');
    const [onlyOwned, setOnlyOwned]   = useState(false);
    const [selected, setSelected]     = useState(null);

    useEffect(() => {
        api.getCollection().then(data => {
            const map = {};
            data.cards.forEach(c => { map[c.pokemon_id] = c.quantity; });
            setOwned(map);
        });
    }, []);

    useEffect(() => {
        async function loadBatch(ids) {
            const results = await Promise.all(ids.map(id => fetchPokemon(id).catch(() => null)));
            const map = {};
            results.forEach((p, i) => { if (p) map[ids[i]] = p; });
            setPokemons(prev => ({ ...prev, ...map }));
        }
        for (let batch = 0; batch < 16; batch++) {
            const ids = Array.from({ length: 10 }, (_, i) => batch * 10 + i + 1).filter(id => id <= 151);
            setTimeout(() => loadBatch(ids), batch * 150);
        }
    }, []);

    const filteredList = useMemo(() => {
        let ids = Array.from({ length: 151 }, (_, i) => i + 1);

        if (onlyOwned) ids = ids.filter(id => owned[id]);

        if (search.trim()) {
            const q = search.toLowerCase();
            ids = ids.filter(id => {
                const p = pokemons[id];
                return p && (p.name.toLowerCase().includes(q) || p.number.includes(q));
            });
        }

        if (typeFilter) {
            ids = ids.filter(id => pokemons[id]?.types.some(t => t.key === typeFilter));
        }

        ids.sort((a, b) => {
            if (sortBy === 'name') {
                const va = pokemons[a]?.name || '';
                const vb = pokemons[b]?.name || '';
                return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
            }
            const va = sortBy === 'quantity' ? (owned[a] || 0) : a;
            const vb = sortBy === 'quantity' ? (owned[b] || 0) : b;
            return sortDir === 'asc' ? va - vb : vb - va;
        });

        return ids;
    }, [pokemons, owned, search, typeFilter, sortBy, sortDir, onlyOwned]);

    const ownedCount = Object.keys(owned).length;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Cabecera */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-black text-white tracking-wide">📖 Mi Colección</h1>
                <p className="text-zinc-400 mt-2 font-medium">{ownedCount} / 151 Pokémon obtenidos</p>
                <div className="max-w-md mx-auto mt-4 h-3 bg-zinc-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-yellow-400 rounded-full transition-all duration-700"
                        style={{ width: `${(ownedCount / 151) * 100}%` }}
                    />
                </div>
            </div>

            {/* CONTROLES FORZADOS EN FILA (Flex-row obligatorio) */}
            <div className="flex flex-row items-center justify-between gap-3 w-full mb-8 overflow-x-auto pb-2">
                
                {/* Buscador */}
                <div className="relative flex-1 min-w-[200px]">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">🔍</span>
                    <input
                        type="text" 
                        placeholder="Buscar Pokémon..."
                        value={search} 
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-600 rounded-lg pl-9 pr-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500 text-sm"
                    />
                </div>

                {/* Filtro de Tipos */}
                <select
                    value={typeFilter}
                    onChange={e => setTypeFilter(e.target.value)}
                    className="bg-zinc-800 border border-zinc-600 rounded-lg px-4 py-2.5 text-zinc-300 text-sm focus:outline-none focus:border-yellow-500 cursor-pointer min-w-[150px]"
                >
                    <option value="">Todos los tipos</option>
                    {TYPES.map(type => (
                        <option key={type} value={type}>{TYPE_LABELS[type]}</option>
                    ))}
                </select>

                {/* Ordenar por */}
                <select
                    value={sortBy} 
                    onChange={e => setSortBy(e.target.value)}
                    className="bg-zinc-800 border border-zinc-600 rounded-lg px-4 py-2.5 text-zinc-300 text-sm focus:outline-none focus:border-yellow-500 cursor-pointer min-w-[120px]"
                >
                    <option value="id">ID</option>
                    <option value="name">Nombre</option>
                    <option value="quantity">Cantidad</option>
                </select>

                {/* Dirección del orden */}
                <button
                    onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
                    className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2.5 text-zinc-300 text-sm transition-colors font-medium min-w-[140px]"
                >
                    {sortDir === 'asc' ? '↑ Ascendente' : '↓ Descendente'}
                </button>

                {/* Solo mis cartas */}
                <button
                    onClick={() => setOnlyOwned(v => !v)}
                    className={`px-6 py-2.5 rounded-lg text-sm font-bold border transition-colors whitespace-nowrap ${
                        onlyOwned 
                            ? 'bg-yellow-500 border-yellow-500 text-zinc-900' 
                            : 'bg-zinc-800 border-zinc-600 text-zinc-300 hover:bg-zinc-700'
                    }`}
                >
                    Solo mis cartas
                </button>
            </div>

            {/* GRID FORZADO A 4 COLUMNAS */}
            <div className="grid grid-cols-4 gap-6">
                {filteredList.map(id => (
                    <CardMini
                        key={id}
                        pokemon={pokemons[id] || null}
                        owned={!!owned[id]}
                        quantity={owned[id] || 0}
                        onClick={() => owned[id] && pokemons[id] && setSelected({ p: pokemons[id], q: owned[id] })}
                    />
                ))}
            </div>

            {selected && (
                <PokemonModal
                    pokemon={selected.p}
                    quantity={selected.q}
                    onClose={() => setSelected(null)}
                />
            )}
        </div>
    );
}