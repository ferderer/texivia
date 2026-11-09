/**
 * Router Strategy Benchmark
 * 
 * Compares five routing strategies:
 * 1. Linear loop (iterate through individual regexes)
 * 2. Single compiled regex (Texivia approach)
 * 3. Partitioned regex by first segment
 * 4. Partitioned regex by first 2 chars
 * 5. Trie-based lookup
 *
 * Uses process.hrtime.bigint() for nanosecond resolution.
 */

// ============================================================
// Route generation
// ============================================================

const STATIC_PREFIXES = [
  'dashboard', 'settings', 'about', 'pricing', 'docs', 'blog',
  'help', 'support', 'contact', 'terms', 'privacy', 'faq',
  'changelog', 'status', 'careers', 'partners', 'enterprise',
  'security', 'compliance', 'integrations', 'marketplace', 'community',
  'events', 'webinars', 'podcasts', 'newsletter', 'press', 'media',
  'investors', 'governance', 'accessibility', 'sitemap'
];

const RESOURCE_TYPES = [
  'users', 'posts', 'products', 'orders', 'invoices', 'teams',
  'projects', 'tasks', 'comments', 'reviews', 'notifications',
  'messages', 'files', 'images', 'videos', 'tags', 'categories',
  'reports', 'analytics', 'exports', 'imports', 'webhooks',
  'tokens', 'sessions', 'roles', 'permissions', 'audits', 'logs'
];

const SUB_RESOURCES = [
  'comments', 'attachments', 'history', 'versions', 'shares',
  'reactions', 'followers', 'members', 'settings', 'metadata'
];

const API_VERSIONS = ['v1', 'v2', 'v3'];

function generateRoutes(count) {
  const routes = [];
  const usedPaths = new Set();

  function addRoute(name, path, hasDynamic = false) {
    if (routes.length >= count || usedPaths.has(path)) return false;
    usedPaths.add(path);
    routes.push({ name, path, hasDynamic });
    return true;
  }

  // Layer 1: static routes
  for (const prefix of STATIC_PREFIXES) {
    if (routes.length >= count) break;
    addRoute(prefix, `/${prefix}`);
  }

  // Layer 2: single-param resource routes
  for (const res of RESOURCE_TYPES) {
    if (routes.length >= count) break;
    addRoute(`${res}_list`, `/${res}`);
    addRoute(`${res}_detail`, `/${res}/{id:\\d+}`, true);
  }

  // Layer 3: nested resource routes
  for (const res of RESOURCE_TYPES) {
    for (const sub of SUB_RESOURCES) {
      if (routes.length >= count) break;
      addRoute(
        `${res}_${sub}`,
        `/${res}/{id:\\d+}/${sub}`,
        true
      );
      addRoute(
        `${res}_${sub}_detail`,
        `/${res}/{id:\\d+}/${sub}/{subId:\\d+}`,
        true
      );
    }
    if (routes.length >= count) break;
  }

  // Layer 4: API-versioned routes
  for (const ver of API_VERSIONS) {
    for (const res of RESOURCE_TYPES) {
      if (routes.length >= count) break;
      addRoute(
        `api_${ver}_${res}`,
        `/api/${ver}/${res}/{id:\\d+}`,
        true
      );
      for (const sub of SUB_RESOURCES) {
        if (routes.length >= count) break;
        addRoute(
          `api_${ver}_${res}_${sub}`,
          `/api/${ver}/${res}/{id:\\d+}/${sub}`,
          true
        );
      }
    }
  }

  // Layer 5: fill remaining with generated deep routes
  let gen = 0;
  while (routes.length < count) {
    const depth = 2 + (gen % 4);
    const segments = [];
    for (let d = 0; d < depth; d++) {
      if (d % 2 === 0) {
        segments.push(`seg${gen}_${d}`);
      } else {
        segments.push(`{p${d}:\\d+}`);
      }
    }
    addRoute(`gen_${gen}`, '/' + segments.join('/'), true);
    gen++;
  }

  return routes;
}

// ============================================================
// Strategy 1: Linear loop
// ============================================================

function buildLinearRouter(routes) {
  const compiled = routes.map(r => {
    const regexStr = r.path
      .replace(/\{(\w+)(?::([^}]+))?\}/g, (_, name, pattern) =>
        `(?<${name}>${pattern || '[^/]+'})`)
      .replace(/\*/g, '.*');
    return { name: r.name, regex: new RegExp(`^${regexStr}$`) };
  });

  return function match(url) {
    for (const route of compiled) {
      const m = route.regex.exec(url);
      if (m) return { name: route.name, params: m.groups || {} };
    }
    return null;
  };
}

// ============================================================
// Strategy 2: Single compiled regex (Texivia approach)
// ============================================================

function buildSingleRegexRouter(routes) {
  const parts = routes.map(r => {
    const regexStr = r.path
      .replace(/\{(\w+)(?::([^}]+))?\}/g, (_, name, pattern) =>
        `(?<${r.name}__${name}>${pattern || '[^/]+'})`)
      .replace(/\*/g, '.*');
    return `(?<${r.name}>${regexStr})`;
  });

  const combined = new RegExp(`^(?:${parts.join('|')})$`);

  return function match(url) {
    const m = combined.exec(url);
    if (!m) return null;
    const groups = m.groups || {};
    for (const key in groups) {
      if (groups[key] !== undefined && !key.includes('__')) {
        const params = {};
        const prefix = key + '__';
        for (const pk in groups) {
          if (pk.startsWith(prefix) && groups[pk] !== undefined) {
            params[pk.slice(prefix.length)] = groups[pk];
          }
        }
        return { name: key, params };
      }
    }
    return null;
  };
}

// ============================================================
// Strategy 3: Partitioned regex by first segment
// ============================================================

function buildPartitionedSegmentRouter(routes) {
  const buckets = new Map();

  for (const r of routes) {
    const firstSeg = r.path.split('/')[1]?.replace(/\{.*/, '') || '_root';
    const key = firstSeg.split('{')[0] || '_dynamic';
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(r);
  }

  const compiled = new Map();
  for (const [key, bucket] of buckets) {
    compiled.set(key, buildSingleRegexRouter(bucket));
  }

  // Fallback for dynamic first segments
  const fallbackKeys = [...compiled.keys()];

  return function match(url) {
    const firstSeg = url.split('/')[1] || '_root';
    const router = compiled.get(firstSeg);
    if (router) {
      const result = router(url);
      if (result) return result;
    }
    // Fallback: try all buckets (handles edge cases)
    for (const key of fallbackKeys) {
      if (key === firstSeg) continue;
      const result = compiled.get(key)(url);
      if (result) return result;
    }
    return null;
  };
}

// ============================================================
// Strategy 4: Partitioned regex by first 2 chars
// ============================================================

function buildPartitioned2CharRouter(routes) {
  const buckets = new Map();

  for (const r of routes) {
    const key = r.path.substring(1, 3) || '__';
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(r);
  }

  const compiled = new Map();
  for (const [key, bucket] of buckets) {
    compiled.set(key, buildSingleRegexRouter(bucket));
  }

  const fallbackKeys = [...compiled.keys()];

  return function match(url) {
    const key = url.substring(1, 3) || '__';
    const router = compiled.get(key);
    if (router) {
      const result = router(url);
      if (result) return result;
    }
    for (const fk of fallbackKeys) {
      if (fk === key) continue;
      const result = compiled.get(fk)(url);
      if (result) return result;
    }
    return null;
  };
}

// ============================================================
// Strategy 5: Trie-based lookup
// ============================================================

function buildTrieRouter(routes) {
  const root = { children: new Map(), param: null, route: null };

  for (const r of routes) {
    const segments = r.path.split('/').filter(Boolean);
    let node = root;

    for (const seg of segments) {
      const paramMatch = seg.match(/^\{(\w+)(?::([^}]+))?\}$/);
      if (paramMatch) {
        if (!node.param) {
          node.param = {
            node: { children: new Map(), param: null, route: null },
            name: paramMatch[1],
            pattern: paramMatch[2] ? new RegExp(`^${paramMatch[2]}$`) : null
          };
        }
        node = node.param.node;
      } else if (seg === '*') {
        node.wildcard = { route: r.name };
        break;
      } else {
        if (!node.children.has(seg)) {
          node.children.set(seg, { children: new Map(), param: null, route: null });
        }
        node = node.children.get(seg);
      }
    }
    node.route = r.name;
  }

  return function match(url) {
    const segments = url.split('/').filter(Boolean);
    const params = {};
    let node = root;

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];

      // Try exact match first
      if (node.children.has(seg)) {
        node = node.children.get(seg);
        continue;
      }

      // Try param match
      if (node.param) {
        if (!node.param.pattern || node.param.pattern.test(seg)) {
          params[node.param.name] = seg;
          node = node.param.node;
          continue;
        }
      }

      // Try wildcard
      if (node.wildcard) {
        return { name: node.wildcard.route, params };
      }

      return null;
    }

    if (node.route) return { name: node.route, params };
    if (node.wildcard) return { name: node.wildcard.route, params };
    return null;
  };
}

// ============================================================
// Benchmark engine
// ============================================================

function generateTestUrls(routes, position) {
  // position: 'first', 'middle', 'last', 'nomatch'
  if (position === 'nomatch') {
    return ['/this/path/does/not/exist/anywhere/12345'];
  }

  let idx;
  if (position === 'first') idx = 0;
  else if (position === 'middle') idx = Math.floor(routes.length / 2);
  else idx = routes.length - 1;

  const route = routes[idx];
  // Replace params with concrete values
  const url = route.path
    .replace(/\{(\w+)(?::([^}]+))?\}/g, '42')
    .replace(/\*/, 'anything');

  return [url];
}

function benchmarkSingle(matchFn, url, iterations) {
  // Warmup
  for (let i = 0; i < 1000; i++) {
    matchFn(url);
  }

  // Measure
  const start = process.hrtime.bigint();
  for (let i = 0; i < iterations; i++) {
    matchFn(url);
  }
  const end = process.hrtime.bigint();

  const totalNs = Number(end - start);
  const perOpNs = totalNs / iterations;
  const opsPerSec = 1e9 / perOpNs;

  return { totalNs, perOpNs, opsPerSec };
}

function runBenchmark(routeCount, iterations = 500_000) {
  const routes = generateRoutes(routeCount);

  // Build routers and measure compilation time
  const strategies = {};

  let start, end;

  start = process.hrtime.bigint();
  strategies.linear = buildLinearRouter(routes);
  end = process.hrtime.bigint();
  const linearBuildNs = Number(end - start);

  start = process.hrtime.bigint();
  strategies.singleRegex = buildSingleRegexRouter(routes);
  end = process.hrtime.bigint();
  const singleRegexBuildNs = Number(end - start);

  start = process.hrtime.bigint();
  strategies.partSegment = buildPartitionedSegmentRouter(routes);
  end = process.hrtime.bigint();
  const partSegmentBuildNs = Number(end - start);

  start = process.hrtime.bigint();
  strategies.part2Char = buildPartitioned2CharRouter(routes);
  end = process.hrtime.bigint();
  const part2CharBuildNs = Number(end - start);

  start = process.hrtime.bigint();
  strategies.trie = buildTrieRouter(routes);
  end = process.hrtime.bigint();
  const trieBuildNs = Number(end - start);

  const buildTimes = {
    linear: linearBuildNs,
    singleRegex: singleRegexBuildNs,
    partSegment: partSegmentBuildNs,
    part2Char: part2CharBuildNs,
    trie: trieBuildNs
  };

  const positions = ['first', 'middle', 'last', 'nomatch'];
  const results = {};

  for (const pos of positions) {
    const urls = generateTestUrls(routes, pos);
    const url = urls[0];

    results[pos] = {};
    for (const [name, matchFn] of Object.entries(strategies)) {
      // Verify correctness first
      const testResult = matchFn(url);
      const correct = pos === 'nomatch' ? testResult === null : testResult !== null;

      results[pos][name] = {
        ...benchmarkSingle(matchFn, url, iterations),
        correct,
        matchedRoute: testResult?.name || null
      };
    }
  }

  return { routeCount, routes: routes.length, buildTimes, results, iterations };
}

// ============================================================
// Median benchmark (run multiple times, take median)
// ============================================================

function runBenchmarkMedian(routeCount, runs = 5, iterations = 500_000) {
  const allResults = [];

  for (let r = 0; r < runs; r++) {
    allResults.push(runBenchmark(routeCount, iterations));
  }

  // Take median of perOpNs for each strategy+position combo
  const median = (arr) => {
    const sorted = [...arr].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
  };

  const positions = ['first', 'middle', 'last', 'nomatch'];
  const strategyNames = ['linear', 'singleRegex', 'partSegment', 'part2Char', 'trie'];

  const medianResults = {};
  for (const pos of positions) {
    medianResults[pos] = {};
    for (const strat of strategyNames) {
      const perOpValues = allResults.map(r => r.results[pos][strat].perOpNs);
      const medPerOp = median(perOpValues);
      medianResults[pos][strat] = {
        perOpNs: medPerOp,
        opsPerSec: 1e9 / medPerOp,
        correct: allResults[0].results[pos][strat].correct,
        matchedRoute: allResults[0].results[pos][strat].matchedRoute
      };
    }
  }

  // Median build times
  const medianBuild = {};
  for (const strat of strategyNames) {
    medianBuild[strat] = median(allResults.map(r => r.buildTimes[strat]));
  }

  return {
    routeCount,
    routes: allResults[0].routes,
    buildTimes: medianBuild,
    results: medianResults,
    iterations: allResults[0].iterations,
    runs
  };
}

// ============================================================
// Output formatting
// ============================================================

function formatNs(ns) {
  if (ns >= 1e6) return `${(ns / 1e6).toFixed(2)}ms`;
  if (ns >= 1e3) return `${(ns / 1e3).toFixed(2)}μs`;
  return `${ns.toFixed(0)}ns`;
}

function formatOps(ops) {
  if (ops >= 1e6) return `${(ops / 1e6).toFixed(2)}M ops/s`;
  if (ops >= 1e3) return `${(ops / 1e3).toFixed(2)}K ops/s`;
  return `${ops.toFixed(0)} ops/s`;
}

function printResults(data) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`ROUTE COUNT: ${data.routes} | Iterations: ${data.iterations} | Runs: ${data.runs || 1}`);
  console.log('='.repeat(80));

  console.log('\nBuild/Compilation Times:');
  for (const [name, ns] of Object.entries(data.buildTimes)) {
    console.log(`  ${name.padEnd(16)} ${formatNs(ns)}`);
  }

  for (const [pos, strategies] of Object.entries(data.results)) {
    console.log(`\nMatch position: ${pos.toUpperCase()}`);
    console.log(`  ${'Strategy'.padEnd(16)} ${'ns/op'.padStart(10)} ${'ops/sec'.padStart(16)} ${'OK?'.padStart(5)}`);
    console.log(`  ${'-'.repeat(49)}`);

    // Sort by perOpNs
    const sorted = Object.entries(strategies).sort((a, b) => a[1].perOpNs - b[1].perOpNs);
    for (const [name, res] of sorted) {
      console.log(
        `  ${name.padEnd(16)} ${formatNs(res.perOpNs).padStart(10)} ${formatOps(res.opsPerSec).padStart(16)} ${(res.correct ? '  ✓' : '  ✗').padStart(5)}`
      );
    }
  }
}

// ============================================================
// CSV export for charting
// ============================================================

function exportCsv(allData) {
  const lines = ['routeCount,position,strategy,nsPerOp,opsPerSec,buildTimeNs'];
  for (const data of allData) {
    for (const [pos, strategies] of Object.entries(data.results)) {
      for (const [strat, res] of Object.entries(strategies)) {
        lines.push([
          data.routes,
          pos,
          strat,
          res.perOpNs.toFixed(2),
          res.opsPerSec.toFixed(0),
          data.buildTimes[strat]
        ].join(','));
      }
    }
  }
  return lines.join('\n');
}

// ============================================================
// Main
// ============================================================

const ROUTE_COUNTS = [10, 25, 50, 100, 250, 500, 1000];
const RUNS = 3;
const ITERATIONS_BY_SIZE = {
  10: 200_000,
  25: 200_000,
  50: 200_000,
  100: 100_000,
  250: 50_000,
  500: 30_000,
  1000: 20_000
};

console.log('Router Strategy Benchmark');
console.log(`Node.js ${process.version}`);
console.log(`Platform: ${process.platform} ${process.arch}`);
console.log(`Date: ${new Date().toISOString()}`);
console.log(`\nRoute counts: ${ROUTE_COUNTS.join(', ')}`);
console.log(`Runs per count: ${RUNS} (median taken)`);

const allData = [];

for (const count of ROUTE_COUNTS) {
  const iterations = ITERATIONS_BY_SIZE[count] || 50_000;
  process.stdout.write(`\nBenchmarking ${count} routes (${iterations.toLocaleString()} iterations)...`);

  try {
    const data = runBenchmarkMedian(count, RUNS, iterations);
    allData.push(data);
    printResults(data);
  } catch (e) {
    console.error(`\n  ERROR at ${count} routes: ${e.message}`);
  }
}

// Export CSV
const csv = exportCsv(allData);
const fs = await import('fs');
fs.writeFileSync('benchmark-results.csv', csv);
console.log(`\nCSV exported to benchmark-results.csv`);
console.log('\nDone.');
