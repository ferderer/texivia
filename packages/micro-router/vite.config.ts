import { defineConfig } from 'vite';
import { minify } from 'terser';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/texivia-micro.ts',
      name: 'Texivia',
      fileName: (format) => `texivia.${format}.js`
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
                passes: 3, // Multiple passes for better minification
                toplevel: true, // More aggressive optimizations
                pure_getters: true,
              },
              mangle: {
                toplevel: true,
                properties: { regex: /^_/ } // Mangle properties starting with underscore
              },
              format: {
                comments: false,
                indent_level: 0,
                beautify: false,
                ascii_only: true,
                wrap_iife: true,
                semicolons: true,
                inline_script: true,
                webkit: true,
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
      }
    }
  ],
});
