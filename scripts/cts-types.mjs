// Writes a CommonJS copy (*.d.cts) of every declaration file in ./dist, so that
// `require` consumers under moduleResolution node16/nodenext get CJS-typed
// declarations (dist/*.d.ts count as ESM because the packages are "type": "module").
// Relative specifiers './x.js' become './x.cjs' (→ x.d.cts). Run in the package directory.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

for (const file of readdirSync('dist')) {
  if (!file.endsWith('.d.ts')) continue;
  const source = readFileSync(`dist/${file}`, 'utf8');
  const cts = source.replace(/(['"])(\.\.?\/[^'"]+)\.js\1/g, '$1$2.cjs$1');
  writeFileSync(`dist/${file.slice(0, -5)}.d.cts`, cts);
}
