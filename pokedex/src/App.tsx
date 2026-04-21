// App.tsx
// Componente raíz de la Pokédex. Orquesta todos los demás componentes:
// - ParticlesCanvas → fondo animado con canvas
// - Hero header     → título, contadores y buscador
// - TypeFilter      → botones de filtro por tipo
// - PokemonCard     → grid de tarjetas
// - PokemonModal    → modal de detalles (condicional)
//
// La lógica de datos vive en usePokedex.ts, aquí solo hay lógica de UI:
// qué pokémon está seleccionado para el modal (selectedPokemon).

import { useState, useEffect, useRef } from 'react';
import { usePokedex } from './usePokedex.ts';
import type { Pokemon } from './usePokedex.ts';
import PokemonCard  from './PokemonCard';
import TypeFilter   from './TypeFilter';
import PokemonModal from './PokemonModal';
import './App.css';

// ─── COMPONENTE: ParticlesCanvas ─────────────────────────────────────────────
// Canvas de posición fixed que cubre toda la pantalla y dibuja 80 partículas
// flotando en loop con requestAnimationFrame. Es puramente decorativo y
// usa pointer-events: none (CSS) para no interferir con los clics del usuario.

// Tipo de cada partícula para el array DOTS
interface Dot {
  x:     number; // posición horizontal
  y:     number; // posición vertical
  r:     number; // radio en px
  vx:    number; // velocidad horizontal
  vy:    number; // velocidad vertical
  alpha: number; // opacidad (0-1)
}

function ParticlesCanvas() {
  // useRef<HTMLCanvasElement>(null) le dice a TS que la ref apunta a un <canvas>
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return; // guarda de seguridad: si el canvas no existe, no hace nada

    // getContext devuelve CanvasRenderingContext2D | null → el ! asegura que no es null
    const ctx = canvas.getContext('2d')!;

    // Dimensiones iniciales = tamaño de la ventana
    let W = canvas.width  = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    let raf: number; // ID del requestAnimationFrame, necesario para cancelarlo en el cleanup

    // Crea 80 partículas con posición, tamaño, velocidad y opacidad aleatorias.
    // El tipo Dot garantiza que cada partícula tiene todas las propiedades necesarias.
    const DOTS: Dot[] = Array.from({ length: 80 }, () => ({
      x:     Math.random() * W,            // posición horizontal inicial
      y:     Math.random() * H,            // posición vertical inicial
      r:     Math.random() * 1.5 + 0.3,   // radio entre 0.3 y 1.8 px
      vx:    (Math.random() - 0.5) * 0.25, // velocidad X: lenta y bidireccional
      vy:    (Math.random() - 0.5) * 0.25, // velocidad Y: lenta y bidireccional
      alpha: Math.random() * 0.5 + 0.1,   // opacidad entre 0.1 y 0.6
    }));

    // Loop de animación: limpia el canvas y redibuja cada partícula en su nueva posición
    const draw = (): void => {
      ctx.clearRect(0, 0, W, H); // borra el frame anterior

      DOTS.forEach((d: Dot) => {
        d.x += d.vx; // avanza en X
        d.y += d.vy; // avanza en Y

        // Wrap-around: si sale por un borde, aparece por el lado opuesto
        if (d.x < 0) d.x = W;
        if (d.x > W) d.x = 0;
        if (d.y < 0) d.y = H;
        if (d.y > H) d.y = 0;

        // Dibuja un círculo pequeño (partícula)
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,190,255,${d.alpha})`; // azul-lavanda semitransparente
        ctx.fill();
      });

      raf = requestAnimationFrame(draw); // programa el siguiente frame
    };

    draw(); // arranca el loop

    // Redimensiona el canvas si el usuario cambia el tamaño de la ventana
    const onResize = (): void => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    // Limpieza: cancela el loop y elimina el listener al desmontar el componente
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, []); // [] → solo se ejecuta al montar

  return <canvas ref={canvasRef} className="particles-canvas" />;
}

// ─── COMPONENTE PRINCIPAL: App ────────────────────────────────────────────────
export default function App() {

  // Desestructura todo lo necesario del custom hook
  const {
    pokemon,    // lista filtrada de pokémon a mostrar en el grid (Pokemon[])
    loading,    // true mientras la API responde (boolean)
    error,      // mensaje de error si el fetch falla (string | null)
    search,     setSearch,       // valor + setter del input de búsqueda
    activeType, setActiveType,   // tipo activo + setter para el filtro
    allTypes,   // array de tipos únicos ['all', 'bug', 'fire', ...]
    total,      // total de pokémon cargados (para los contadores)
  } = usePokedex();

  // Estado local de UI: qué pokémon está seleccionado para mostrar en el modal.
  // Pokemon | null → null = modal cerrado, objeto = modal abierto con ese pokémon.
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);

  // ── PANTALLA DE CARGA ──────────────────────────────────────────────────────
  // Muestra un spinner con el título y el progreso mientras llegan los datos.
  if (loading) return (
    <div className="loading-screen">
      <p className="loading-title">POKÉDEX</p>
      <div className="pokeball-loader" /> {/* spinner CSS puro */}
      <p className="loading-sub">Cargando {total} / 151</p>
    </div>
  );

  // ── PANTALLA DE ERROR ──────────────────────────────────────────────────────
  if (error) return <div className="error-screen">{error}</div>;

  // ── RENDER PRINCIPAL ───────────────────────────────────────────────────────
  return (
    <>
      {/* ParticlesCanvas está fuera del .app para cubrir toda la pantalla */}
      <ParticlesCanvas />

      <div className="app">

        {/* ── HERO HEADER ─────────────────────────────────────────────────── */}
        <header className="hero">
          {/* Pokébola gigante decorativa que rota lentamente (animación CSS) */}
          <div className="hero-pokeball" />

          {/* Eyebrow — texto pequeño encima del título */}
          <p className="hero-eyebrow">National Pokédex • Gen I</p>

          {/* Título principal en Bebas Neue con gradient text */}
          <h1 className="hero-title">POKÉDEX</h1>

          {/* Contadores en pill glassmorphism */}
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-num">{total}</span>
              <span className="hero-stat-label">Total</span>
            </div>
            <div className="hero-stat">
              {/* Mostrando cambia en tiempo real al filtrar */}
              <span className="hero-stat-num">{pokemon.length}</span>
              <span className="hero-stat-label">Mostrando</span>
            </div>
            <div className="hero-stat">
              {/* allTypes.length - 1 porque 'all' no es un tipo real de la API */}
              <span className="hero-stat-num">{allTypes.length - 1}</span>
              <span className="hero-stat-label">Tipos</span>
            </div>
          </div>

          {/* Input de búsqueda — onChange actualiza el estado en cada tecla */}
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              type="text"
              placeholder="Buscar Pokémon..."
              value={search}
              // React.ChangeEvent<HTMLInputElement> es el tipo del evento del input
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            />
          </div>
        </header>

        {/* ── FILTROS POR TIPO ─────────────────────────────────────────────── */}
        {/* TypeFilter es un componente controlado: no tiene estado propio,
            solo recibe datos y notifica al padre mediante onTypeChange */}
        <TypeFilter
          types={allTypes}
          activeType={activeType}
          onTypeChange={setActiveType}
        />

        {/* ── BARRA DE RESULTADOS ──────────────────────────────────────────── */}
        {/* Muestra cuántos pokémon hay en la vista actual y el filtro activo */}
        <div className="results-bar">
          <span className="results-count">
            <strong>{pokemon.length}</strong> resultados
          </span>
          {/* Línea decorativa con gradiente que separa los dos extremos */}
          <div className="divider-line" />
          <span className="results-count">
            {activeType !== 'all' ? `Tipo: ${activeType}` : 'Todos los tipos'}
          </span>
        </div>

        {/* ── GRID DE TARJETAS ─────────────────────────────────────────────── */}
        <div className="grid">
          {pokemon.length === 0 ? (
            // Estado vacío: no hay resultados para el filtro/búsqueda actual
            <div className="empty-state">
              <div className="empty-state-icon">😔</div>
              <p>No se encontraron Pokémon</p>
            </div>
          ) : (
            // Renderiza una PokemonCard por cada pokémon en la lista filtrada.
            // `index` se pasa para el stagger de animación de entrada.
            pokemon.map((p: Pokemon, i: number) => (
              <PokemonCard
                key={p.id}                   // key única y estable (el ID no cambia)
                pokemon={p}                  // objeto completo tipado como Pokemon
                index={i}                    // posición para el delay de animación
                onClick={setSelectedPokemon} // (pokemon: Pokemon) => void
              />
            ))
          )}
        </div>
      </div>

      {/* ── MODAL ────────────────────────────────────────────────────────────── */}
      {/* Renderizado condicional: el modal SOLO existe en el DOM si hay un
          pokémon seleccionado. Al cerrar, setSelectedPokemon(null) lo desmonta
          completamente, limpiando sus useEffects (listeners, overflow, etc.) */}
      {selectedPokemon && (
        <PokemonModal
          pokemon={selectedPokemon}
          onClose={() => setSelectedPokemon(null)} // cierra el modal
        />
      )}
    </>
  );
}