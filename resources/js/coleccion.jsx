import { useState, useEffect, useMemo } from 'react'
import { api } from '../api'
import { fetchPokemon, TYPE_COLORS } from '../pokeapi'
import PokemonCard from '../components/PokemonCard'
 
/**
 * Collection.jsx — Pokédex del usuario.
 *
 * Muestra los 151 Pokémon. Los obtenidos en color, los no obtenidos como silueta.
 * Incluye: buscador, filtro por tipo, ordenación y modal de detalle.
 */
 
// Los 18 tipos principales para los filtros
const TYPES = [
  'fire','water','grass','electric','psychic','normal',
  'fighting','poison','ground','flying','bug','rock',
  'ghost','dragon','dark','steel','ice','fairy',
]
const TYPE_LABELS = {
  fire:'Fuego', water:'Agua', grass:'Planta', electric:'Eléctrico',
  psychic:'Psíquico', normal:'Normal', fighting:'Lucha', poison:'Veneno',
  ground:'Tierra', flying:'Volador', bug:'Bicho', rock:'Roca',
  ghost:'Fantasma', dragon:'Dragón', dark:'Siniestro', steel:'Acero',
  ice:'Hielo', fairy:'Hada',
}
 
export default function Collection() {
  const [owned, setOwned]         = useState({})    // { pokemon_id: quantity }
  const [pokemons, setPokemons]   = useState({})    // { id: pokemonData }
  const [search, setSearch]       = useState('')
  const [typeFilter, setTypeFilter] = useState(null)
  const [sortBy, setSortBy]       = useState('id')  // 'id' | 'name' | 'quantity'
  const [sortDir, setSortDir]     = useState('asc') // 'asc' | 'desc'
  const [onlyOwned, setOnlyOwned] = useState(false)
  const [selected, setSelected]   = useState(null)  // Pokémon del modal
  const [loadingIds, setLoadingIds] = useState(new Set())
 
  // Cargamos la colección del usuario al montar
  useEffect(() => {
    api.get('/collection').then(data => {
      const map = {}
      data.cards.forEach(c => { map[c.pokemon_id] = c.quantity })
      setOwned(map)
    })
  }, [])
 
  // Cargamos los datos de la PokeAPI de forma incremental (de 10 en 10)
  useEffect(() => {
    async function loadBatch(ids) {
      setLoadingIds(prev => new Set([...prev, ...ids]))
      const results = await Promise.all(ids.map(id => fetchPokemon(id).catch(() => null)))
      const map = {}
      results.forEach((p, i) => { if (p) map[ids[i]] = p })
      setPokemons(prev => ({ ...prev, ...map }))
      setLoadingIds(prev => {
        const next = new Set(prev)
        ids.forEach(id => next.delete(id))
        return next
      })
    }
 
    // Cargamos en bloques de 10 para no saturar la API
    for (let batch = 0; batch < 16; batch++) {
      const ids = Array.from({ length: 10 }, (_, i) => batch * 10 + i + 1).filter(id => id <= 151)
      setTimeout(() => loadBatch(ids), batch * 200)
    }
  }, [])
 
  // Lista filtrada y ordenada
  const filteredList = useMemo(() => {
    let ids = Array.from({ length: 151 }, (_, i) => i + 1)
 
    // Filtro "solo en posesión"
    if (onlyOwned) ids = ids.filter(id => owned[id])
 
    // Buscador por nombre o número
    if (search.trim()) {
      const q = search.toLowerCase().trim()
      ids = ids.filter(id => {
        const p = pokemons[id]
        if (!p) return false
        return p.name.toLowerCase().includes(q) || p.number.includes(q)
      })
    }
 
    // Filtro por tipo
    if (typeFilter) {
      ids = ids.filter(id => {
        const p = pokemons[id]
        return p && p.types.some(t => t.key === typeFilter)
      })
    }
 
    // Ordenación
    ids.sort((a, b) => {
      let va, vb
      if (sortBy === 'name') {
        va = pokemons[a]?.name || ''
        vb = pokemons[b]?.name || ''
        return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
      }
      if (sortBy === 'quantity') {
        va = owned[a] || 0
        vb = owned[b] || 0
      } else {
        va = a; vb = b
      }
      return sortDir === 'asc' ? va - vb : vb - va
    })
 
    return ids
  }, [pokemons, owned, search, typeFilter, sortBy, sortDir, onlyOwned])
 
  const ownedCount = Object.keys(owned).length
 
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Cabecera */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-white">📖 Mi Colección</h1>
        <p className="text-gray-400 mt-1">{ownedCount} / 151 Pokémon obtenidos</p>
 
        {/* Barra de progreso */}
        <div className="max-w-sm mx-auto mt-3 h-3 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-yellow-400 rounded-full transition-all duration-700"
            style={{ width: `${(ownedCount / 151) * 100}%` }}
          />
        </div>
      </div>
 
      {/* Controles de filtro */}
      <div className="space-y-3 mb-6">
        {/* Fila 1: búsqueda + ordenación */}
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="🔍 Buscar por nombre o número..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 min-w-48 bg-gray-700 border border-gray-600 rounded-lg
                       px-4 py-2 text-white placeholder-gray-500 focus:outline-none
                       focus:border-yellow-500 text-sm"
          />
 
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2
                       text-white text-sm focus:outline-none"
          >
            <option value="id">Ordenar por: ID</option>
            <option value="name">Ordenar por: Nombre</option>
            <option value="quantity">Ordenar por: Cantidad</option>
          </select>
 
          <button
            onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2
                       text-white text-sm hover:bg-gray-600 transition-colors"
          >
            {sortDir === 'asc' ? '↑ Asc' : '↓ Desc'}
          </button>
 
          <button
            onClick={() => setOnlyOwned(v => !v)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border
                        ${onlyOwned
                          ? 'bg-yellow-500 border-yellow-500 text-gray-900'
                          : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'}`}
          >
            Solo mis cartas
          </button>
        </div>
 
        {/* Fila 2: filtros por tipo */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setTypeFilter(null)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors
                        ${!typeFilter ? 'bg-white text-gray-900' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            Todos
          </button>
          {TYPES.map(type => (
            <button
              key={type}
              onClick={() => setTypeFilter(typeFilter === type ? null : type)}
              style={typeFilter === type ? { backgroundColor: TYPE_COLORS[type] } : {}}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors
                          ${typeFilter === type ? 'text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            >
              {TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      </div>
 
      {/* Grid de cartas */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
        {filteredList.map(id => (
          <div
            key={id}
            className="flex justify-center"
            onClick={() => owned[id] && pokemons[id] && setSelected(pokemons[id])}
          >
            <PokemonCard
              pokemon={pokemons[id] || null}
              owned={!!owned[id]}
              quantity={owned[id] || 0}
              small
            />
          </div>
        ))}
      </div>
 
      {/* Modal de detalle */}
      {selected && (
        <PokemonModal pokemon={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
 
/** Modal de detalle del Pokémon */
function PokemonModal({ pokemon, onClose }) {
  const mainColor = pokemon.types[0]?.color || '#555'
  const secColor  = pokemon.types[1]?.color || mainColor
 
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-sm w-full rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: `linear-gradient(135deg, ${mainColor}cc, ${secColor}ee)` }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white/70 hover:text-white text-xl z-10"
        >
          ✕
        </button>
 
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
            <p style={{ color: pokemon.rarityColor }} className="text-sm font-bold mt-1">
              ✨ {pokemon.rarityLabel}
            </p>
          </div>
 
          {/* Barras de estadísticas animadas */}
          <div className="mt-4 space-y-2">
            {[
              { label: 'HP',       value: pokemon.hp,      max: 255, emoji: '❤️' },
              { label: 'Ataque',   value: pokemon.attack,  max: 255, emoji: '⚔️' },
              { label: 'Defensa',  value: pokemon.defense, max: 255, emoji: '🛡️' },
              { label: 'Velocidad',value: pokemon.speed,   max: 255, emoji: '💨' },
            ].map(stat => (
              <div key={stat.label} className="flex items-center gap-2">
                <span className="text-xs w-20 text-white/80">{stat.emoji} {stat.label}</span>
                <div className="flex-1 h-2 bg-black/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white/80 rounded-full stat-bar"
                    style={{ '--target': `${(stat.value / stat.max) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-white/80 w-8 text-right">{stat.value}</span>
              </div>
            ))}
          </div>
 
          {/* Info adicional */}
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
 
          {/* Descripción */}
          <p className="mt-4 text-white/80 text-xs leading-relaxed italic">
            "{pokemon.description}"
          </p>
 
          {/* Movimientos */}
          <div className="mt-3 flex gap-2">
            {pokemon.moves.map(m => (
              <span key={m} className="bg-black/30 text-white/70 text-xs rounded-lg px-2 py-1 capitalize">
                ⚡ {m}
              </span>
            ))}
          </div>
        </div>
      </div>
 
      <style>{`
        .stat-bar {
          width: 0;
          animation: growBar 0.8s ease-out forwards;
        }
        @keyframes growBar {
          from { width: 0; }
          to   { width: var(--target); }
        }
      `}</style>
    </div>
  )
}