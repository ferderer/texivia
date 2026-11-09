import { defineConfig } from 'vite';
import { minify } from 'terser';

export default defineConfig({
  build: {
    lib: {
      entry:    'src/index.ts',
      fileName: (fmt) => fmt === 'es' ? 'index.mjs' : 'index.js',
      formats:  ['es', 'cjs'],
    },
    sourcemap: true,
  },
  test: {
    environment: 'jsdom',
  },
  plugins: [
    {
      name: 'custom-terser-minification',
      apply: 'build',
      enforce: 'post',
      async generateBundle(_, bundle) {
        for (const fileName in bundle) {
          const chunk = bundle[fileName];
          if (chunk.type === 'chunk') {
            const result = await minify(chunk.code, {
              compress: {
                drop_console: true,
                drop_debugger: true,
                passes: 3,
                toplevel: true,
                pure_getters: true,
              },
              mangle: {
                toplevel: true,
                properties: { regex: /^_/ },
              },
              format: {
                comments: false,
                ecma: 2015,
              },
              ecma: 2015,
              module: true,
            });
            if (result.code) {
              chunk.code = result.code;
            }
          }
        }
      },
    },
  ],
});
