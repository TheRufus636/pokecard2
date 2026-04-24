// Cache en memoria para no repetir peticiones
const cache = {};

const TYPE_COLORS = {
    fire: '#F08030', water: '#6890F0', grass: '#78C850', electric: '#F8D030',
    psychic: '#F85888', normal: '#A8A878', fighting: '#C03028', poison: '#A040A0',
    ground: '#E0C068', flying: '#A890F0', bug: '#A8B820', rock: '#B8A038',
    ghost: '#705898', dragon: '#7038F8', dark: '#705848', steel: '#B8B8D0',
    ice: '#98D8D8', fairy: '#EE99AC',
};

const TYPE_LABELS = {
    fire: 'Fuego', water: 'Agua', grass: 'Planta', electric: 'Eléctrico',
    psychic: 'Psíquico', normal: 'Normal', fighting: 'Lucha', poison: 'Veneno',
    ground: 'Tierra', flying: 'Volador', bug: 'Bicho', rock: 'Roca',
    ghost: 'Fantasma', dragon: 'Dragón', dark: 'Siniestro', steel: 'Acero',
    ice: 'Hielo', fairy: 'Hada',
};

// Rarezas por ID
function getRarity(id) {
    const legendary = [144, 145, 146, 150, 151];
    const rare      = [131, 132, 143, 138, 139, 140, 141, 142];
    const uncommon  = [1, 2, 3, 4, 5, 6, 7, 8, 9, 25, 26, 133, 134, 135, 136];

    if (legendary.includes(id)) return { label: 'Legendario', color: '#FFD700' };
    if (rare.includes(id))      return { label: 'Raro',       color: '#C0C0C0' };
    if (uncommon.includes(id))  return { label: 'Poco común', color: '#7B68EE' };
    return                             { label: 'Común',      color: '#90EE90' };
}

export async function fetchPokemon(id) {
    if (cache[id]) return cache[id];

    try {
        const [pokeRes, speciesRes] = await Promise.all([
            fetch(`https://pokeapi.co/api/v2/pokemon/${id}`),
            fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`),
        ]);

        const poke    = await pokeRes.json();
        const species = await speciesRes.json();

        // Descripción en español o inglés
        const descEntry = species.flavor_text_entries.find(
            e => e.language.name === 'es'
        ) || species.flavor_text_entries.find(
            e => e.language.name === 'en'
        );
        const description = descEntry
            ? descEntry.flavor_text.replace(/\f|\n/g, ' ')
            : '';

        const types = poke.types.map(t => ({
            key:   t.type.name,
            label: TYPE_LABELS[t.type.name] || t.type.name,
            color: TYPE_COLORS[t.type.name]  || '#888',
        }));

        const stats = {};
        poke.stats.forEach(s => { stats[s.stat.name] = s.base_stat; });

        const rarity = getRarity(id);

        const data = {
            id,
            number:       String(id).padStart(3, '0'),
            name:         poke.name.charAt(0).toUpperCase() + poke.name.slice(1),
            sprite:       poke.sprites.other?.['official-artwork']?.front_default
                          || poke.sprites.front_default,
            types,
            hp:           stats.hp            || 0,
            attack:       stats.attack        || 0,
            defense:      stats.defense       || 0,
            speed:        stats['speed']      || 0,
            spAtk:        stats['special-attack']  || 0,
            spDef:        stats['special-defense'] || 0,
            height:       (poke.height / 10).toFixed(1),
            weight:       (poke.weight / 10).toFixed(1),
            description,
            moves:        poke.moves.slice(0, 2).map(m =>
                m.move.name.replace(/-/g, ' ')
            ),
            rarityLabel:  rarity.label,
            rarityColor:  rarity.color,
        };

        cache[id] = data;
        return data;
    } catch {
        return null;
    }
}

export { TYPE_COLORS, TYPE_LABELS };
