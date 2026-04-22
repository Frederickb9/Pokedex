import { useEffect } from 'react';
import type { CSSProperties } from 'react';
import { TYPE_COLORS_MAP, CARD_COLORS_MAP } from './usePokedex.ts';
import type { Pokemon } from './usePokedex.ts';

// TIPOS DE TYPESCRIP T
interface CustomCSS extends CSSProperties {
  '--card-color'?: string;  // color oscuro del tipo para el gradiente del modal
  '--fill-color'?: string;  // color claro del tipo para el glow de las barras de stat
}

// Props que recibe PokemonModal desde App.tsx
interface PokemonModalProps {
  pokemon: Pokemon;   // objeto completo de la PokeAPI
  onClose: () => void; // función del padre que pone selectedPokemon en null
}

// Metadatos de cada stat: etiqueta legible, ícono y valor máximo posible.
interface StatMeta {
  label: string;
  max:   number;
  icon:  string;
}

const STAT_META: Record<string, StatMeta> = {
  hp:               { label: 'HP',        max: 255, icon: '❤️' },
  attack:           { label: 'Ataque',    max: 190, icon: '⚔️' },
  defense:          { label: 'Defensa',   max: 230, icon: '🛡️' },
  'special-attack': { label: 'Sp. Atk',  max: 194, icon: '✨' },
  'special-defense':{ label: 'Sp. Def',  max: 230, icon: '💫' },
  speed:            { label: 'Velocidad', max: 200, icon: '💨' },
};

export default function PokemonModal({ pokemon, onClose }: PokemonModalProps) {

  // Cierre con tecla Escape
  useEffect(() => {
    const fn = (e: KeyboardEvent): void => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn); // limpieza
  }, [onClose]);

  // Bloquear scroll del body mientras el modal está abierto 
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Variables derivadas del objeto pokémon
  const primaryType = pokemon.types[0].type.name;
  const cardColor   = CARD_COLORS_MAP[primaryType] ?? '#333'; // color oscuro para gradiente del modal
  const typeColor   = TYPE_COLORS_MAP[primaryType] ?? '#aaa'; // color claro para barras de stats
  const sprite      =
    pokemon.sprites.other['official-artwork'].front_default || // imagen HD
    pokemon.sprites.front_default ||                           // fallback pixelado
    '';
  const formattedId = `#${String(pokemon.id).padStart(3, '0')}`;

  // La API devuelve peso en hectogramos y altura en decímetros → convertir a kg y m
  const weightKg = (pokemon.weight / 10).toFixed(1); // 69 → 6.9 kg
  const heightM  = (pokemon.height / 10).toFixed(1); // 7  → 0.7 m

  // base_experience puede ser null en algunos Pokémon especiales → mostrar '—'
  const baseXP: string | number = pokemon.base_experience ?? '—';

  // Objeto de estilo tipado con interfaz personalizada
  const modalStyle: CustomCSS = { '--card-color': cardColor };

  return (
    // OVERLAY
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        style={modalStyle}
      >

        <button className="modal-close" onClick={onClose}>✕</button>

        {/*SECCIÓN HERO (imagen)*/}
        <div className="modal-hero">
          <div className="modal-hero-bg" />
          <div className="modal-hero-rings">
            <div className="ring ring-1" />
            <div className="ring ring-2" />
            <div className="ring ring-3" />
          </div>
          <img src={sprite} alt={pokemon.name} className="modal-sprite" />
        </div>

        {/*CUERPO DEL MODAL*/}
        <div className="modal-body">
          <div className="modal-name-row">
            <span className="modal-id-tag">{formattedId}</span>
          </div>
          <h2 className="modal-name">{pokemon.name}</h2>
          <div className="modal-types">
            {pokemon.types.map(({ type }) => (
              <span
                key={type.name}
                className="type-badge"
                style={{ backgroundColor: TYPE_COLORS_MAP[type.name] ?? '#aaa' }}
              >
                {type.name}
              </span>
            ))}
          </div>

          {/*FICHA DE INFO BÁSICA*/}
          {/* Grid de 3 tarjetas glassmorphism: Peso / Talla / XP Base */}
          <div className="modal-info-cards">
            <div className="info-card">
              <span className="info-card-icon">⚖️</span>
              <span className="info-card-val">{weightKg} kg</span>
              <span className="info-card-label">Peso</span>
            </div>
            <div className="info-card">
              <span className="info-card-icon">📏</span>
              <span className="info-card-val">{heightM} m</span>
              <span className="info-card-label">Talla</span>
            </div>
            <div className="info-card">
              <span className="info-card-icon">⭐</span>
              <span className="info-card-val">{baseXP}</span>
              <span className="info-card-label">XP Base</span>
            </div>
          </div>

          {/* ── HABILIDADES ── */}
          {/* modal-section-title usa ::after para dibujar la línea divisora */}
          <p className="modal-section-title">Habilidades</p>
          <div className="abilities-row">
            {pokemon.abilities.map(({ ability, is_hidden }) => (
              <span key={ability.name} className="ability-chip">
                {ability.name}
                {/* Las habilidades ocultas (hidden abilities) se marcan con 🔒 */}
                {is_hidden ? ' 🔒' : ''}
              </span>
            ))}
          </div>

          {/* ── ESTADÍSTICAS BASE ── */}
          <p className="modal-section-title">Estadísticas base</p>
          <div className="stats-grid">
            {pokemon.stats.map(({ stat, base_stat }) => {
              const meta: StatMeta = STAT_META[stat.name] ?? { label: stat.name, max: 255, icon: '•' };
              const pct = Math.round((base_stat / meta.max) * 100);

              // Estilo tipado para la barra de progreso con su glow
              const barStyle: CustomCSS = {
                width:           `${pct}%`,
                backgroundColor: typeColor,
                '--fill-color':  typeColor, // usada por box-shadow en CSS
              };

              return (
                <div key={stat.name} className="stat-row">
                  {/* Nombre del stat con ícono */}
                  <span className="stat-name">{meta.icon} {meta.label}</span>
                  {/* Valor numérico en font-mono */}
                  <span className="stat-val">{base_stat}</span>
                  {/* Barra de progreso: ancho dinámico + glow del color del tipo */}
                  <div className="stat-bar-bg">
                    <div className="stat-bar-fill" style={barStyle} />
                  </div>
                </div>
              );
            })}
          </div>

          {/*MOVIMIENTOS (primeros 12)*/}
          <p className="modal-section-title">Movimientos</p>
          <div className="moves-wrap">
            {pokemon.moves.slice(0, 12).map(({ move }) => (
              <span key={move.name} className="move-chip">{move.name}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}