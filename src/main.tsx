import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Estilos globais antes dos componentes: os CSS modules precisam vir depois na cascata
import './styles/tokens.css';
import './styles/base.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
