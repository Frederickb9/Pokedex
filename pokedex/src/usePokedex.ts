import { useState, useEffect, useMemo } from 'react';

// Representa un tipo individual dentro del array pokemon.types
interface PokemonType {
  slot: number;
  type: {
    name: string; // 'fire', 'water', 'grass', etc.
    url:  string;
  };
}

// Representa una estadística base (hp, attack, speed, etc.)
interface PokemonStat {
  base_stat: number; // valor numérico del stat (0-255)
  effort:    number;
  stat: {
    name: string; // 'hp', 'attack', 'defense', etc.
    url:  string;
  };
}

// Representa una habilidad del Pokémon
interface PokemonAbility {
  is_hidden: boolean; // true = habilidad oculta (hidden ability)
  slot:      number;
  ability: {
    name: string; // 'overgrow', 'blaze', etc.
    url:  string;
  };
}

// Representa un movimiento del Pokémon
interface PokemonMove {
  move: {
    name: string; // 'tackle', 'flamethrower', etc.
    url:  string;
  };
}

// Estructura completa de un Pokémon tal como la devuelve la PokeAPI
export interface Pokemon {
  id:               number;
  name:             string;
  weight:           number;           // en hectogramos (dividir entre 10 para kg)
  height:           number;           // en decímetros (dividir entre 10 para m)
  base_experience:  number | null;    // puede ser null en Pokémon especiales
  types:            PokemonType[];
  stats:            PokemonStat[];
  abilities:        PokemonAbility[];
  moves:            PokemonMove[];
  sprites: {
    front_default: string | null;     // sprite pixelado clásico (fallback)
    other: {
      'official-artwork': {
        front_default: string | null; // imagen HD oficial (preferida)
      };
    };
  };
}

// Tipo de retorno del hook, para que quien lo consuma sepa exactamente qué recibe
export interface UsePokedexReturn {
  pokemon:       Pokemon[];
  loading:       boolean;
  error:         string | null;
  search:        string;
  setSearch:     (v: string) => void;
  activeType:    string;
  setActiveType: (v: string) => void;
  allTypes:      string[];
  total:         number;
}

// MAPAS DE COLORES POR TIPO
// Record<string, string> = objeto cuyas claves y valores son strings.
// TYPE_COLORS_MAP → color claro para los badges (texto negro encima).
// CARD_COLORS_MAP → color oscuro para gradientes de tarjetas y modal.
export const TYPE_COLORS_MAP: Record<string, string> = {
  fire: '#FF6B35',     water: '#4FC3F7',   grass: '#81C784',
  electric: '#FFD54F', psychic: '#F48FB1', ice: '#80DEEA',
  dragon: '#9575CD',   dark: '#78909C',    fairy: '#F8BBD9',
  normal: '#BCAAA4',   fighting: '#EF9A9A',flying: '#90CAF9',
  poison: '#CE93D8',   ground: '#FFCC80',  rock: '#A1887F',
  bug: '#A5D6A7',      ghost: '#7E57C2',   steel: '#B0BEC5',
};

export const CARD_COLORS_MAP: Record<string, string> = {
  fire: '#ff4500',     water: '#1565c0',   grass: '#1b5e20',
  electric: '#f57f17', psychic: '#880e4f', ice: '#006064',
  dragon: '#4527a0',   dark: '#444',       fairy: '#ad1457',
  normal: '#4e342e',   fighting: '#b71c1c',flying: '#0277bd',
  poison: '#6a1b9a',   ground: '#e65100',  rock: '#37474f',
  bug: '#33691e',      ghost: '#311b92',   steel: '#263238',
};

// Cantidad de Pokémon a cargar — Gen I completa
const TOTAL_POKEMON = 151;

// CUSTOM HOOK: usePokedex
// Encapsula toda la lógica de datos: fetch, estados, filtrado y tipos.
// Al separarlo de App.tsx, el componente raíz queda limpio y solo se encarga
// de renderizar. Este patrón se llama "Separation of Concerns".
export function usePokedex(): UsePokedexReturn {

  // ESTADOS
  const [allPokemon, setAllPokemon] = useState<Pokemon[]>([]);       // Array con los 151 objetos de la API
  const [loading, setLoading]       = useState<boolean>(true);       // true mientras la API responde
  const [error, setError]           = useState<string | null>(null); // mensaje de error si el fetch falla
  const [search, setSearch]         = useState<string>('');          // texto del input de búsqueda
  const [activeType, setActiveType] = useState<string>('all');       // tipo seleccionado en el filtro

  // FETCH INICIAL
  // useEffect con [] vacío = se ejecuta una sola vez al montar el componente.
  // Lanza las 151 peticiones EN PARALELO con Promise.all — si fueran secuenciales tardaría ~30s; en paralelo tarda ~1-2s.
  useEffect(() => {
    const fetchAll = async (): Promise<void> => {
      try {
        setLoading(true);

        // Array.from crea un array de 151 Promesas (una por Pokémon).
        // El callback (_, i) recibe el índice: i=0 → pokémon/1, i=1 → pokémon/2...
        const promises = Array.from({ length: TOTAL_POKEMON }, (_, i) =>
          fetch(`https://pokeapi.co/api/v2/pokemon/${i + 1}`).then(r => r.json() as Promise<Pokemon>)
        );

        // Promise.all espera a que TODAS las promesas resuelvan antes de continuar.
        // Retorna un array con los 151 objetos JSON ya parseados y tipados como Pokemon[].
        const results = await Promise.all(promises);
        setAllPokemon(results);

      } catch (err) {
        // Si cualquier fetch falla (sin conexión, API caída), guarda el mensaje
        setError('No se pudo cargar la Pokédex. Verifica tu conexión.');
      } finally {
        // finally siempre se ejecuta, tanto si hubo error como si no.
        // Garantiza que el spinner desaparezca pase lo que pase.
        setLoading(false);
      }
    };
    fetchAll();
  }, []); // ← array de dependencias vacío = solo se ejecuta al montar

  // TIPOS ÚNICOS
  // useMemo recalcula solo cuando allPokemon cambia (es decir, una sola vez después del fetch). Usa un Set para eliminar duplicados automáticamente.
  // Resultado: ['all', 'bug', 'dragon', 'electric', 'fairy', 'fire', ...]
  const allTypes = useMemo<string[]>(() => {
    const types = new Set<string>();
    allPokemon.forEach(p =>
      p.types.forEach(t => types.add(t.type.name))
    );
    return ['all', ...Array.from(types).sort()]; // 'all' siempre primero
  }, [allPokemon]);

  // FILTRADO EN TIEMPO REAL
  // useMemo recalcula la lista filtrada cada vez que cambian: allPokemon,
  // search o activeType. Sin useMemo, el filtro correría en cada re-render
  // aunque nada relevante haya cambiado.
  const filtered = useMemo<Pokemon[]>(() => {
    return allPokemon.filter(p => {
      // matchName: el nombre del Pokémon contiene el texto del buscador
      const matchName = p.name.toLowerCase().includes(search.toLowerCase());
      // matchType: el filtro es 'all' O el Pokémon tiene ese tipo
      const matchType = activeType === 'all' ||
        p.types.some(t => t.type.name === activeType);
      // Ambas condiciones deben cumplirse
      return matchName && matchType;
    });
  }, [allPokemon, search, activeType]);

  //RETORNO DEL HOOK
  // Expone todo lo que App.tsx necesita: datos + setters + estado de UI
  return {
    pokemon: filtered,  // lista ya filtrada (la que se renderiza)
    loading,
    error,
    search,     setSearch,       // estado + setter para el input
    activeType, setActiveType,   // estado + setter para los botones de tipo
    allTypes,                    // array de tipos para renderizar los botones
    total: allPokemon.length,    // total de pokémon cargados (para el contador)
  };
}