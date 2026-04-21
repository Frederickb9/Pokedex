// main.tsx
// Punto de entrada de la aplicación Vite + React + TypeScript.
// Su única responsabilidad es montar el componente raíz <App /> en el DOM.
// Este archivo casi nunca se modifica durante el desarrollo.

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

// document.getElementById('root') devuelve HTMLElement | null.
// El operador ! (non-null assertion) le dice a TypeScript:
// "confía en mí, este elemento siempre existe" — está definido en index.html.
// Sin el ! TypeScript marcaría error porque createRoot no acepta null.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)