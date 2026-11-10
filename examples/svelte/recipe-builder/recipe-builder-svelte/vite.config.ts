import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  server: {
    // the apps call /api on their own origin; the backend (examples/recipe-api) listens on 8080
    proxy: { '/api': 'http://localhost:8080' },
  },
})
