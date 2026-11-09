// Shared vite library build config for all packages in packages/*.
// Usage in packages/<name>/vite.config.ts:
//   import { libConfig } from '../../vite.lib';
//   export default libConfig();                       // dist/index.{mjs,js}
//   export default libConfig({ fileBase: 'texivia' }); // dist/texivia.{mjs,js}
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { minify } from 'terser';

/** Runtime dependencies of the package being built (vite runs in the package directory). */
function dependencies(): string[] {
  const pkg = JSON.parse(readFileSync(resolve(process.cwd(), 'package.json'), 'utf8'));
  return Object.keys({ ...pkg.dependencies, ...pkg.peerDependencies });
}

type LibOptions = {
  /** Entry module, relative to the package directory. */
  entry?: string;
  /** Global name (only used by UMD/IIFE formats). */
  name?: string;
  /** Base name of the output files. */
  fileBase?: string;
};

export function libConfig({ entry = 'src/index.ts', name, fileBase = 'index' }: LibOptions = {}) {
  return defineConfig({
    build: {
      lib: {
        entry,
        name,
        fileName: (format) => format === 'es' ? `${fileBase}.mjs` : `${fileBase}.js`,
        formats: ['es', 'cjs'],
      },
      sourcemap: true,
      // never bundle another package: consumers must share one copy (ecosystem ADR-0002)
      rollupOptions: { external: dependencies() },
    },
    test: {
      environment: 'jsdom',
      exclude: ['node_modules/**'],
    },
    plugins: [
      {
        name: 'custom-terser-minification',
        apply: 'build',
        enforce: 'post',
        async generateBundle(_, bundle) {
          for (const fileName in bundle) {
            const chunk = bundle[fileName];
            if (chunk.type !== 'chunk') continue;
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
                properties: { regex: /^_/ }, // mangle members starting with an underscore
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
            if (result.code) chunk.code = result.code;
          }
        },
      },
    ],
  });
}
