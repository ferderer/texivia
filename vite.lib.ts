// Shared vite library build config.
// Each package imports this and passes its own entry + name.
import { defineConfig } from 'vite';
import { minify } from 'terser';

export function libConfig(entry: string, name: string) {
  return defineConfig({
    build: {
      lib: {
        entry,
        name,
        fileName: (fmt) => fmt === 'es' ? 'index.mjs' : 'index.js',
        formats: ['es', 'cjs'],
      },
      sourcemap: true,
    },
    test: {
      environment: 'jsdom',
      exclude: ['node_modules/**'],
    },
    plugins: [{
      name: 'terser',
      apply: 'build',
      enforce: 'post',
      async generateBundle(_, bundle) {
        for (const f in bundle) {
          const chunk = bundle[f];
          if (chunk.type !== 'chunk') continue;
          const r = await minify(chunk.code, {
            compress: { drop_console: true, passes: 3, toplevel: true, pure_getters: true },
            mangle:   { toplevel: true, properties: { regex: /^_/ } },
            format:   { comments: false, ecma: 2015 },
            ecma: 2015, module: true,
          });
          if (r.code) chunk.code = r.code;
        }
      }
    }],
  });
}
