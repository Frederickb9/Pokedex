import type { CSSProperties } from 'react';
import { TYPE_COLORS_MAP, CARD_COLORS_MAP } from './usePokedex.ts';
import type { Pokemon } from './usePokedex.ts';

// TIPOS DE TYPESCRIPT
interface CustomCSS extends CSSProperties {
  '--card-color'?: string;
}

// Props que recibe PokemonCard desde App.tsx
interface PokemonCardProps {
  pokemon: Pokemon;                    // objeto completo devuelto por la PokeAPI
  onClick: (pokemon: Pokemon) => void; // función del padre que setea el pokémon seleccionado
  index:   number;                     // posición en el array filtrado, para el stagger de animación
}

export default function PokemonCard({ pokemon, onClick, index }: PokemonCardProps) {

  // El tipo PRINCIPAL siempre es el primero del array de tipos
  const primaryType = pokemon.types[0].type.name;

  // Color oscuro del tipo → variable CSS para gradientes y efectos de la tarjeta
  const cardColor = CARD_COLORS_MAP[primaryType] ?? '#333';

  // Sprite oficial en alta resolución; si no existe, cae al sprite pixelado clásico.
  // El operador || maneja tanto null como undefined.
  const sprite =
    pokemon.sprites.other['official-artwork'].front_default ||
    pokemon.sprites.front_default ||
    '';

  // Número del Pokémon con ceros a la izquierda: 1→#001, 25→#025, 151→#151
  const formattedId = `#${String(pokemon.id).padStart(3, '0')}`;

  // Extrae los 3 stats que se muestran en la tarjeta (resumen rápido).
  // El operador ?. y ?? evitan errores si un stat no existe en la respuesta.
  const hp  = pokemon.stats.find(s => s.stat.name === 'hp')?.base_stat ?? 0;
  const atk = pokemon.stats.find(s => s.stat.name === 'attack')?.base_stat ?? 0;
  const spd = pokemon.stats.find(s => s.stat.name === 'speed')?.base_stat ?? 0;

  // Stagger de entrada: cada tarjeta aparece 35ms después de la anterior.
  // El tope de 600ms evita esperas largas cuando hay muchos resultados.
  const delay = Math.min(index * 35, 600);

  // Objeto de estilo tipado con interfaz personalizada
  const cardStyle: CustomCSS = {
    '--card-color': cardColor,        // Variable CSS para gradiente y efectos hover
    animationDelay: `${delay}ms`,     // Stagger de la animación cardReveal del CSS
  };

  return (
    <div
      className="pokemon-card"
      onClick={() => onClick(pokemon)}  // Pasa el objeto completo al padre para el modal
      style={cardStyle}
    >
      {/* Número formateado arriba a la izquierda — usa font-mono */}
      <span className="pokemon-id">{formattedId}</span>

      {/* Wrapper de imagen: el ::before genera el glow radial del color del tipo */}
      <div className="card-img-wrap">
        <img
          src={sprite}
          alt={pokemon.name}
          loading="lazy" // Carga diferida: no descarga la imagen hasta que sea visible en pantalla
        />
      </div>

      {/* Nombre capitalizado por CSS (text-transform: capitalize) */}
      <h2>{pokemon.name}</h2>

      {/* Badges de tipos — pueden ser 1 o 2 */}
      <div className="types">
        {pokemon.types.map(({ type }) => (
          <span
            key={type.name}
            className="type-badge"
            // Cada badge tiene el color claro de su tipo como fondo
            style={{ backgroundColor: TYPE_COLORS_MAP[type.name] ?? '#aaa' }}
          >
            {type.name}
          </span>
        ))}
      </div>

      {/* Stats rápidos: HP / Ataque / Velocidad — resumen sin abrir el modal */}
      <div className="card-stats">
        <div className="card-stat">
          <span className="card-stat-icon">❤️</span>
          <span className="card-stat-val">{hp}</span>
        </div>
        <div className="card-stat">
          <span className="card-stat-icon">⚔️</span>
          <span className="card-stat-val">{atk}</span>
        </div>
        <div className="card-stat">
          <span className="card-stat-icon">💨</span>
          <span className="card-stat-val">{spd}</span>
        </div>
      </div>
    </div>
  );
}