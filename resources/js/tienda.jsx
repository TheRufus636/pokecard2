import { useState, useEffect } from 'react';
import { api } from './api.js';
import { fetchPokemon } from './pokeapi.js';

const PACKS = [
    {
        id: 'basico',
        name: 'Sobre Básico',
        desc: 'Ideal para empezar tu colección',
        cards: 5,
        price: 50,
        color: '#ef4444',
        gif: '/img/pokeballred.gif',
        accent: 'border-red-500',
        btn: 'bg-red-600 hover:bg-red-700',
    },
    {
        id: 'estandar',
        name: 'Sobre Estándar',
        desc: 'Más cartas, más posibilidades',
        cards: 12,
        price: 100,
        color: '#3b82f6',
        gif: '/img/superball.gif',
        accent: 'border-blue-500',
        btn: 'bg-blue-600 hover:bg-blue-700',
        featured: true,
    },
    {
        id: 'premium',
        name: 'Sobre Premium',
        desc: 'La mejor forma de completar tu Pokédex',
        cards: 25,
        price: 200,
        color: '#a855f7',
        gif: '/img/lunaball.gif',
        accent: 'border-purple-500',
        btn: 'bg-purple-600 hover:bg-purple-700',
    },
];

function PokemonCardFlip({ pokemonId, delay = 0 }) {
    const [pokemon, setPokemon] = useState(null);
    const [flipped, setFlipped] = useState(false);

    useEffect(() => {
        fetchPokemon(pokemonId).then(p => {
            setPokemon(p);
            setTimeout(() => setFlipped(true), delay);
        });
    }, [pokemonId, delay]);

    const mainColor = pokemon?.types[0]?.color || '#555';

    return (
        <div
            className="w-24 h-36 cursor-pointer"
            style={{ perspective: '600px' }}
            onClick={() => setFlipped(f => !f)}
        >
            <div
                style={{
                    width: '100%', height: '100%',
                    position: 'relative',
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.6s ease',
                    transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
            >
                {/* Dorso */}
                <div style={{
                    position: 'absolute', width: '100%', height: '100%',
                    backfaceVisibility: 'hidden',
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
                    border: '2px solid #4f46e5',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <img src="/img/pokeball.gif" className="w-10 h-10 opacity-70" />
                </div>

                {/* Frente */}
                <div style={{
                    position: 'absolute', width: '100%', height: '100%',
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    borderRadius: 12,
                    background: `linear-gradient(135deg, ${mainColor}cc, ${mainColor}88)`,
                    border: `2px solid ${mainColor}`,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'space-between',
                    padding: '6px 4px',
                    overflow: 'hidden',
                }}>
                    {pokemon ? (
                        <>
                            <p style={{ color: '#fff', fontSize: 9, fontWeight: 700, opacity: 0.8 }}>
                                #{pokemon.number}
                            </p>
                            <img
                                src={pokemon.sprite}
                                alt={pokemon.name}
                                style={{ width: 56, height: 56, objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}
                            />
                            <p style={{ color: '#fff', fontSize: 10, fontWeight: 800, textAlign: 'center', lineHeight: 1.1 }}>
                                {pokemon.name}
                            </p>
                            <div style={{ display: 'flex', gap: 2 }}>
                                {pokemon.types.map(t => (
                                    <span key={t.key} style={{
                                        background: t.color, color: '#fff',
                                        fontSize: 7, fontWeight: 700,
                                        padding: '1px 4px', borderRadius: 99,
                                    }}>
                                        {t.label}
                                    </span>
                                ))}
                            </div>
                            <p style={{ color: pokemon.rarityColor, fontSize: 8, fontWeight: 700 }}>
                                {pokemon.rarityLabel}
                            </p>
                        </>
                    ) : (
                        <div style={{ color: '#fff', fontSize: 10, opacity: 0.5 }}>...</div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function Tienda({ user, updateCoins }) {
    const [buying, setBuying] = useState(null);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null); // { cards: [], coins }
    const [reloading, setReloading] = useState(false);

    async function comprarSobre(packId) {
        setError('');
        setBuying(packId);
        try {
            const data = await api.buyPack(packId);
            setResult({ cards: data.drawn_cards, coins: data.coins });
            updateCoins(data.coins);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al comprar');
        } finally {
            setBuying(null);
        }
    }

    async function recargarMonedas() {
        setReloading(true);
        try {
            const data = await api.reloadCoins();
            updateCoins(data.coins);
        } catch { }
        setReloading(false);
    }

    return (
        
        <div className="max-w-6xl mx-auto px-4 h-[calc(100vh-100px)] flex flex-col justify-center">
            
            
            <div className="text-center mb-8">
                <h1 className="text-4xl font-black text-white">Tienda de Sobres</h1>
                <p className="text-zinc-400 mt-2">Elige un sobre y completa tu Pokédex</p>
                
            </div>

            {error && (
                <div className="bg-red-900/40 border border-red-500 text-red-300 text-center rounded-xl px-4 py-3 mb-6">
                    {error}
                </div>
            )}

           
            <div className="grid grid-cols-3 gap-4 lg:gap-6">
                {PACKS.map(pack => (
                    <div
                        key={pack.id}
                        
                        className={`relative bg-zinc-900 rounded-2xl border-2 ${pack.accent} p-4 lg:p-6 flex flex-col items-center transition-transform hover:-translate-y-1 shadow-lg`}
                    >
                        

                        <div
                            className="w-full rounded-xl py-8 flex justify-center mb-5"
                            style={{ background: `${pack.color}22`, border: `1px solid ${pack.color}44` }}
                        >
                            <img src={pack.gif} className="h-20 w-20" alt={pack.name} />
                        </div>

                        <h3 className="text-lg font-black text-white uppercase tracking-wide">{pack.name}</h3>
                        <p className="text-zinc-400 text-sm mt-1 mb-4 text-center">{pack.desc}</p>

                        <div className="flex justify-between w-full px-2 mb-5 text-sm font-bold">
                            <span className="text-zinc-300">{pack.cards} cartas</span>
                            <span style={{ color: pack.color }}>🪙 {pack.price}</span>
                        </div>

                        <button
                            onClick={() => comprarSobre(pack.id)}
                            disabled={buying === pack.id || user.coins < pack.price}
                            className={`w-full ${pack.btn} disabled:opacity-40 text-white font-bold py-3 rounded-xl transition-colors`}
                        >
                            {buying === pack.id ? 'Abriendo...' : user.coins < pack.price ? 'Sin monedas' : 'Comprar'}
                        </button>
                    </div>
                ))}
            </div>

            {/* Modal resultado */}
            {result && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                    onClick={() => setResult(null)}
                >
                    <div
                        className="bg-zinc-900 border border-zinc-600 rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto"
                        onClick={e => e.stopPropagation()}
                    >
                        <h2 className="text-2xl font-black text-white text-center mb-2">¡Sobre abierto!</h2>
                        <p className="text-zinc-400 text-center text-sm mb-6">
                            Haz clic en las cartas para revelarlas • Monedas restantes: 🪙 {result.coins}
                        </p>

                        <div className="flex flex-wrap gap-3 justify-center">
                            {result.cards.map((id, i) => (
                                <PokemonCardFlip key={i} pokemonId={id} delay={i * 150} />
                            ))}
                        </div>

                        <button
                            onClick={() => setResult(null)}
                            className="mt-6 w-full bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-3 rounded-xl transition-colors"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
