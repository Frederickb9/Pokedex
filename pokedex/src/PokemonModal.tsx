// PokemonModal.tsx
// Modal de detalles completos del Pokémon seleccionado.
// Se monta cuando App.tsx tiene un pokemon en el estado selectedPokemon.
// Incluye: imagen hero flotante con anillos animados, info básica,
// habilidades, barras de stats con glow y chips de movimientos.
//
// Cierre: clic en el overlay, botón ✕, o tecla Escape.

import { useEffect } from 'react';
import type { CSSProperties } from 'react';
import { TYPE_COLORS_MAP, CARD_COLORS_MAP } from './usePokedex.ts';
import type { Pokemon } from './usePokedex.ts';

// ── TIPOS DE TYPESCRIPT ───────────────────────────────────────────────────────
// Extiende CSSProperties para las variables CSS personalizadas del modal.
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
// El máximo se usa para calcular el porcentaje de la barra (base_stat / max * 100).
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

  // ── Cierre con tecla Escape ────────────────────────────────────────────────
  // Añade un listener al montar y lo LIMPIA al desmontar (return del useEffect).
  // Sin la limpieza, cada vez que se abre el modal se acumularía un listener nuevo.
  // KeyboardEvent es el tipo nativo del DOM para eventos de teclado.
  useEffect(() => {
    const fn = (e: KeyboardEvent): void => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn); // limpieza
  }, [onClose]);

  // ── Bloquear scroll del body mientras el modal está abierto ───────────────
  // Evita que el usuario scrollee la página de fondo al hacer scroll en el modal.
  // El return restaura overflow al desmontar.
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // ── Variables derivadas del objeto pokémon ─────────────────────────────────
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
    // ── OVERLAY ───────────────────────────────────────────────────────────────
    // Clic en el overlay (fondo oscuro) cierra el modal.
    // backdrop-filter: blur+saturate en CSS crea el efecto cinematográfico de fondo.
    <div className="modal-overlay" onClick={onClose}>

      {/* stopPropagation: evita que el clic DENTRO del modal llegue al overlay */}
      <div
        className="modal-content"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        style={modalStyle}
      >

        {/* Botón cerrar — gira 90° al hover (definido en CSS) */}
        <button className="modal-close" onClick={onClose}>✕</button>

        {/* ── SECCIÓN HERO (imagen) ─────────────────────────────────────── */}
        <div className="modal-hero">
          {/* Fondo radial del color del tipo principal */}
          <div className="modal-hero-bg" />

          {/* Tres anillos concéntricos que pulsan con animación ringPulse (CSS) */}
          <div className="modal-hero-rings">
            <div className="ring ring-1" />
            <div className="ring ring-2" />
            <div className="ring ring-3" />
          </div>

          {/* Sprite principal — animación float infinita definida en CSS */}
          <img src={sprite} alt={pokemon.name} className="modal-sprite" />
        </div>

        {/* ── CUERPO DEL MODAL ──────────────────────────────────────────── */}
        <div className="modal-body">

          {/* ID del Pokémon en formato badge rojo */}
          <div className="modal-name-row">
            <span className="modal-id-tag">{formattedId}</span>
          </div>

          {/* Nombre en Bebas Neue — grande y prominente */}
          <h2 className="modal-name">{pokemon.name}</h2>

          {/* Badges de tipos — igual que en la tarjeta */}
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

          {/* ── FICHA DE INFO BÁSICA ── */}
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
              // pct = porcentaje para el ancho de la barra (0-100%)
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

          {/* ── MOVIMIENTOS (primeros 12) ── */}
          {/* slice(0, 12) limita la lista para no saturar el modal */}
          <p className="modal-section-title">Movimientos</p>
          <div className="moves-wrap">
            {pokemon.moves.slice(0, 12).map(({ move }) => (
              // El color de fondo del chip usa color-mix con --card-color (CSS)
              <span key={move.name} className="move-chip">{move.name}</span>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}