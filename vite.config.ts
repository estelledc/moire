import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { config } from './moire.config';

const themeName = config.theme || 'receipt';
const activeThemePath = new URL(`./src/themes/${themeName}/index.svelte`, import.meta.url).pathname;

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  resolve: {
    alias: {
      '$active-theme': activeThemePath
    }
  },
  define: {
    __MOIRE_THEME__: JSON.stringify(themeName)
  },
  server: {
    fs: {
      allow: ['.']
    }
  }
});
