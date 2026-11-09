/// <reference types="vitest/config" />
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  test: {
    environment: 'jsdom',
    environmentOptions: { jsdom: { url: 'http://localhost/' } },
    include: ['tests/**/*.test.ts'],
    // the test calls private router methods (_match, _navigate, …), which the
    // minified dist/ renames – test against the router source instead
    alias: { 'texivia-router': fileURLToPath(new URL('../../../packages/texivia-router/src/index.ts', import.meta.url)) },
  },
})
