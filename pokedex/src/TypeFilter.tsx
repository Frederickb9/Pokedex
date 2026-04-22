import { TYPE_COLORS_MAP } from './usePokedex';

//TIPOS DE TYPESCRIPT
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
const TYPE_ICONS: Record<string, string> = {
  all:'⚡', fire:'🔥', water:'💧', grass:'🌿', electric:'⚡',
  psychic:'🔮', ice:'❄️', dragon:'🐉', dark:'🌑', fairy:'✨',
  normal:'⭐', fighting:'👊', flying:'🌬️', poison:'☠️',
  ground:'🌍', rock:'🪨', bug:'🐛', ghost:'👻', steel:'⚙️',
};

export default function TypeFilter({ types, activeType, onTypeChange }: TypeFilterProps) {
  return (
    <div className="type-filter-section">
      <p className="type-filter-label">Filtrar por tipo</p>

      <div className="type-filter">
        {types.map(type => {
          const isActive = type === activeType; // ¿Este botón está activo?
          const color    = TYPE_COLORS_MAP[type] ?? '#aaa'; // ?? en vez de || para ser más preciso con TS
          const btnStyle: CustomCSS = { '--btn-color': color };

          return (
            <button
              key={type}
              className={`filter-btn ${isActive ? 'active' : ''}`}
              onClick={() => onTypeChange(type)} // Notifica al padre del cambio
              style={btnStyle}
            >
              <span>{TYPE_ICONS[type] ?? '•'}</span>
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