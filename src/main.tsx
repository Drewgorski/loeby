import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.tsx';

// Vite's BASE_URL is '/' in dev and '/loeby/' on GitHub Pages; the router and
// the service worker both have to agree with it or deep links break.
const base = import.meta.env.BASE_URL;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={base}>
      <App />
    </BrowserRouter>
  </StrictMode>,
);

// Ask the browser not to evict this origin's storage under pressure. It does
// NOT protect against the user clearing website data — only a backup file does
// that — but it removes the automatic-eviction risk.
navigator.storage?.persist?.().catch(() => {});

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${base}sw.js`, { scope: base })
      .catch((e) => console.error('Service worker registration failed:', e));
  });
}
