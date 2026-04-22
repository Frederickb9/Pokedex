import { useState, useEffect, useRef } from 'react';
import { usePokedex } from './usePokedex.ts';
import type { Pokemon } from './usePokedex.ts';
import PokemonCard  from './PokemonCard';
import TypeFilter   from './TypeFilter';
import PokemonModal from './PokemonModal';
import './App.css';

// COMPONENTE: ParticlesCanvas 

interface Dot {
  x:     number; 
  y:     number; 
  r:     number; 
  vx:    number; 
  vy:    number; 
  alpha: number; 
}

function ParticlesCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return; 

    const ctx = canvas.getContext('2d')!;

    
    let W = canvas.width  = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    let raf: number;

    const DOTS: Dot[] = Array.from({ length: 80 }, () => ({
      x:     Math.random() * W,            
      y:     Math.random() * H,            
      r:     Math.random() * 1.5 + 0.3,   
      vx:    (Math.random() - 0.5) * 0.25, 
      vy:    (Math.random() - 0.5) * 0.25, 
      alpha: Math.random() * 0.5 + 0.1,   
    }));

    const draw = (): void => {
      ctx.clearRect(0, 0, W, H); 

      DOTS.forEach((d: Dot) => {
        d.x += d.vx; 
        d.y += d.vy; 

        if (d.x < 0) d.x = W;
        if (d.x > W) d.x = 0;
        if (d.y < 0) d.y = H;
        if (d.y > H) d.y = 0;

        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,190,255,${d.alpha})`; 
        ctx.fill();
      });

      raf = requestAnimationFrame(draw); 
    };

    draw(); 

    const onResize = (): void => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="particles-canvas" />;
}

// COMPONENTE PRINCIPAL: App
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
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);

  // PANTALLA DE CARGA
  // Muestra un spinner con el título y el progreso mientras llegan los datos.
  if (loading) return (
    <div className="loading-screen">
      <p className="loading-title">POKÉDEX</p>
      <div className="pokeball-loader" /> {/* spinner CSS puro */}
      <p className="loading-sub">Cargando {total} / 151</p>
    </div>
  );

  //PANTALLA DE ERROR
  if (error) return <div className="error-screen">{error}</div>;

  //RENDER PRINCIPAL
  return (
    <>
      {/* ParticlesCanvas está fuera del .app para cubrir toda la pantalla */}
      <ParticlesCanvas />

      <div className="app">

        {/*HERO HEADER*/}
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
              <span className="hero-stat-num">{pokemon.length}</span>
              <span className="hero-stat-label">Mostrando</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-num">{allTypes.length - 1}</span>
              <span className="hero-stat-label">Tipos</span>
            </div>
          </div>

          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              type="text"
              placeholder="Buscar Pokémon..."
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            />
          </div>
        </header>

        {/*FILTROS POR TIPO*/}
        <TypeFilter
          types={allTypes}
          activeType={activeType}
          onTypeChange={setActiveType}
        />

        {/*BARRA DE RESULTADOS*/}
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

        {/*GRID DE TARJETAS*/}
        <div className="grid">
          {pokemon.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">😔</div>
              <p>No se encontraron Pokémon</p>
            </div>
          ) : (

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

      {/*MODAL*/}
      {selectedPokemon && (
        <PokemonModal
          pokemon={selectedPokemon}
          onClose={() => setSelectedPokemon(null)} // cierra el modal
        />
      )}
    </>
  );
}