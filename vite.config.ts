import react from '@vitejs/plugin-react';
import { copyFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// GitHub Pages serves a project site from /<repo>/, so the built asset paths
// need that prefix. Dev stays at '/'.
const base = process.env.DEPLOY_TARGET === 'gh-pages' ? '/loeby/' : '/';

export default defineConfig({
  base,
  plugins: [
    react(),
    {
      // GitHub Pages has no SPA rewrite, so a deep link like /loeby/progress
      // 404s. Pages serves 404.html for misses, so an identical copy of the
      // shell there makes client-side routing work on hard refresh.
      name: 'spa-404-fallback',
      closeBundle() {
        const dist = resolve(__dirname, 'dist');
        copyFileSync(resolve(dist, 'index.html'), resolve(dist, '404.html'));
      },
    },
  ],
});
