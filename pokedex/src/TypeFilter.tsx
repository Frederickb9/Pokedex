// TypeFilter.tsx
// Componente de filtrado por tipo de Pokémon.
// Recibe el array de tipos disponibles, el tipo activo y un callback para cambiar.
// Cada botón inyecta --btn-color como variable CSS para que el estilo activo
// use el color exacto del tipo sin necesidad de clases individuales.

import { TYPE_COLORS_MAP } from './usePokedex';

// ── TIPOS DE TYPESCRIPT ───────────────────────────────────────────────────────
// CSSProperties extendido para permitir variables CSS personalizadas (--btn-color).
// Por defecto React no acepta propiedades CSS que empiecen con '--', este truco
// extiende el tipo para que TypeScript no marque error.
import type { CSSProperties } from 'react';

interface CustomCSS extends CSSProperties {
  '--btn-color'?: string; // variable CSS del color del tipo
}

// Props que recibe TypeFilter desde App.tsx
interface TypeFilterProps {
  types:        string[];              // ['all', 'fire', 'water', ...] — lista de tipos
  activeType:   string;               // tipo actualmente seleccionado
  onTypeChange: (type: string) => void; // callback al hacer clic en un botón
}

// Íconos emoji representativos de cada tipo (puramente decorativos).
// Record<string, string> permite indexar con cualquier string.
const TYPE_ICONS: Record<string, string> = {
  all:'⚡', fire:'🔥', water:'💧', grass:'🌿', electric:'⚡',
  psychic:'🔮', ice:'❄️', dragon:'🐉', dark:'🌑', fairy:'✨',
  normal:'⭐', fighting:'👊', flying:'🌬️', poison:'☠️',
  ground:'🌍', rock:'🪨', bug:'🐛', ghost:'👻', steel:'⚙️',
};

export default function TypeFilter({ types, activeType, onTypeChange }: TypeFilterProps) {
  return (
    <div className="type-filter-section">

      {/* Etiqueta superior del bloque — usa font-mono y letter-spacing para look técnico */}
      <p className="type-filter-label">Filtrar por tipo</p>

      <div className="type-filter">
        {types.map(type => {
          const isActive = type === activeType; // ¿Este botón está activo?
          const color    = TYPE_COLORS_MAP[type] ?? '#aaa'; // ?? en vez de || para ser más preciso con TS

          // Objeto de estilo tipado con la interfaz personalizada
          const btnStyle: CustomCSS = { '--btn-color': color };

          return (
            <button
              key={type}
              // Agrega la clase 'active' condicionalmente para los estilos CSS
              className={`filter-btn ${isActive ? 'active' : ''}`}
              onClick={() => onTypeChange(type)} // Notifica al padre del cambio
              // --btn-color es usada por el CSS para el fondo activo, el borde y el glow
              style={btnStyle}
            >
              {/* Ícono emoji del tipo */}
              <span>{TYPE_ICONS[type] ?? '•'}</span>

              {/* Texto: 'Todos' para 'all', o el nombre del tipo capitalizado por CSS */}
              <span className="filter-btn-text">
                {type === 'all' ? 'Todos' : type}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}