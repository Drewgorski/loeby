import react from '@vitejs/plugin-react';
import { copyFileSync, readFileSync, writeFileSync } from 'node:fs';
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
      name: 'loeby-deploy-fixups',
      closeBundle() {
        const dist = resolve(__dirname, 'dist');
        const indexPath = resolve(dist, 'index.html');
        const html = readFileSync(indexPath, 'utf8');

        // GitHub Pages has no SPA rewrite, so a deep link like /loeby/progress
        // 404s. Pages serves 404.html for misses, so an identical copy of the
        // shell there makes client-side routing work on hard refresh.
        copyFileSync(indexPath, resolve(dist, '404.html'));

        // Stamp the service worker's cache name with this build's asset hash.
        // Without it every deploy reuses one cache name, so `activate` purges
        // nothing and the offline shell keeps pointing at assets that are no
        // longer on the server.
        const buildId = html.match(/assets\/index-([^.]+)\.js/)?.[1] ?? String(Date.now());
        const swPath = resolve(dist, 'sw.js');
        const sw = readFileSync(swPath, 'utf8').replace('__BUILD_ID__', buildId);
        writeFileSync(swPath, sw);
      },
    },
  ],
});
