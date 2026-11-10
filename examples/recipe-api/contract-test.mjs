#!/usr/bin/env node
// Checks a running server against API.md. Node 20+, no dependencies.
//   node contract-test.mjs [baseUrl]        # default http://localhost:8080
// The server must hold the seed data (seed.json); the test creates recipes and deletes them again.
import { readFileSync } from 'node:fs';

const base = (process.argv[2] ?? process.env.API_URL ?? 'http://localhost:8080').replace(/\/$/, '');
const seed = JSON.parse(readFileSync(new URL('./seed.json', import.meta.url), 'utf8'));

let passed = 0;
const failures = [];

async function test(name, fn) {
  try { await fn(); passed++; console.log(`  ok   ${name}`); }
  catch (e) { failures.push(name); console.log(`  FAIL ${name}\n       ${e.message}`); }
}

// Key order inside objects does not matter, array order does.
const canon = (v) => Array.isArray(v) ? v.map(canon)
  : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, canon(v[k])])) : v;

function equal(actual, expected, what) {
  const a = JSON.stringify(canon(actual)), b = JSON.stringify(canon(expected));
  if (a !== b) throw new Error(`${what}\n       expected ${b}\n       actual   ${a}`);
}
function check(cond, what) { if (!cond) throw new Error(what); }

async function call(method, path, body, { contentType = 'application/json', raw } = {}) {
  const headers = {};
  if (method === 'POST') headers['Content-Type'] = contentType;
  const res = await fetch(base + path, { method, headers, body: raw ?? (body === undefined ? undefined : JSON.stringify(body)) });
  const text = await res.text();
  let json;
  try { json = text ? JSON.parse(text) : undefined; } catch { json = undefined; }
  return { status: res.status, text, json };
}

function expectError(res, status, name, data) {
  equal(res.status, status, `HTTP status of ${name}`);
  const e = res.json;
  check(e && typeof e.timestamp === 'number', 'timestamp is a number');
  equal(e.status, status, 'status in body equals HTTP status');
  check(e.error && e.error.name === name, `error.name is ${name}, got ${JSON.stringify(e.error)}`);
  equal(e.error.code, name.toLowerCase().replaceAll('_', '-'), 'error.code is the kebab form of the name');
  check(typeof e.data === 'object' && e.data !== null && !Array.isArray(e.data), 'data is an object');
  check(e.fields === null || Array.isArray(e.fields), 'fields is null or an array');
  if (data !== undefined) equal(e.data, data, 'error data');
  check(!JSON.stringify(e).includes('/home/') && !JSON.stringify(e).includes('Stack'), 'no server details in the error');
  return e;
}

const valid = () => ({
  title: 'Contract Soup', description: 'Tested', servings: 2, prepTime: 5, cookTime: 15,
  difficulty: 'easy', cuisine: 'Test', dietaryTags: ['vegan'],
  ingredients: [{ name: 'Water', quantity: 1, unit: 'l' }, { name: 'Salt', quantity: 1, unit: 'tsp', notes: 'to taste' }],
  instructions: [{ step: 1, description: 'Boil', duration: 10 }, { step: 2, description: 'Season' }],
  nutrition: { calories: 10, protein: 0, carbs: 1, fat: 0, fiber: 0, sugar: 0 },
  images: ['/_/images/soup.jpg'], author: 'Tester',
});

const ids = (res) => res.json.map((r) => r.id);
const iso = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
const average = (r) => r.ratings.length ? r.ratings.reduce((s, x) => s + x, 0) / r.ratings.length : 0;

console.log(`Recipe API contract test against ${base}`);

await test('list returns the seed recipes in id order', async () => {
  const res = await call('GET', '/api/recipes');
  equal(res.status, 200, 'status');
  equal(res.json.filter((r) => seed.some((s) => s.id === r.id)), seed, 'seed recipes');
  equal(ids(res), [...ids(res)].sort((a, b) => Number(a) - Number(b)), 'order');
});

await test('show returns one recipe', async () => {
  const res = await call('GET', '/api/recipes/show?id=1');
  equal(res.status, 200, 'status');
  equal(res.json, seed[0], 'recipe 1');
});

await test('show: unknown id is 404 DATA_NOT_FOUND', async () => {
  expectError(await call('GET', '/api/recipes/show?id=99999'), 404, 'DATA_NOT_FOUND', { resource: 'recipe', id: '99999' });
});

await test('show: missing id is 400 VALIDATION_MISSING_PARAMETER', async () => {
  expectError(await call('GET', '/api/recipes/show'), 400, 'VALIDATION_MISSING_PARAMETER', { parameter: 'id' });
});

let createdId;
await test('create returns 201 and the recipe; server sets id, ratings and timestamps', async () => {
  const res = await call('POST', '/api/recipes/create', { ...valid(), id: 'x', ratings: [5], createdAt: '2000-01-01T00:00:00Z', unknown: 1 });
  equal(res.status, 201, 'status');
  const r = res.json;
  createdId = r.id;
  check(typeof r.id === 'string' && r.id !== 'x' && Number(r.id) > 3, `id assigned by the server, got ${r.id}`);
  equal(r.ratings, [], 'ratings start empty');
  check(iso.test(r.createdAt) && iso.test(r.updatedAt), `timestamps are ISO 8601 UTC, got ${r.createdAt} / ${r.updatedAt}`);
  check(r.createdAt !== '2000-01-01T00:00:00Z', 'createdAt sent by the client is ignored');
  check(!('unknown' in r), 'unknown fields are dropped');
  const { id, ratings, createdAt, updatedAt, ...rest } = r;
  equal(rest, valid(), 'stored fields');
});

await test('create applies defaults for description, dietaryTags, images, unit', async () => {
  const body = valid();
  delete body.description; delete body.dietaryTags; delete body.images; delete body.ingredients[0].unit;
  const res = await call('POST', '/api/recipes/create', body);
  equal(res.status, 201, 'status');
  equal([res.json.description, res.json.dietaryTags, res.json.images, res.json.ingredients[0].unit], ['', [], [], ''], 'defaults');
  equal((await call('POST', '/api/recipes/delete', { id: res.json.id })).status, 204, 'cleanup');
});

await test('show returns the created recipe', async () => {
  const res = await call('GET', `/api/recipes/show?id=${createdId}`);
  equal(res.status, 200, 'status');
  equal(res.json.title, 'Contract Soup', 'title');
});

await test('update changes only the fields sent, sets updatedAt, ignores author and ratings', async () => {
  const before = (await call('GET', `/api/recipes/show?id=${createdId}`)).json;
  const res = await call('POST', '/api/recipes/update', { id: createdId, title: 'Contract Stew', cookTime: 30, author: 'Other', ratings: [1], createdAt: '2000-01-01T00:00:00Z' });
  equal(res.status, 200, 'status');
  const r = res.json;
  equal([r.title, r.cookTime], ['Contract Stew', 30], 'changed');
  equal([r.author, r.ratings, r.createdAt, r.servings], [before.author, before.ratings, before.createdAt, before.servings], 'unchanged');
  check(iso.test(r.updatedAt) && r.updatedAt >= before.updatedAt, 'updatedAt set');
  equal((await call('GET', `/api/recipes/show?id=${createdId}`)).json, r, 'stored');
});

await test('update replaces arrays as a whole', async () => {
  const res = await call('POST', '/api/recipes/update', { id: createdId, dietaryTags: [], ingredients: [{ name: 'Stock', quantity: 2, unit: 'cup' }] });
  equal(res.json.dietaryTags, [], 'tags');
  equal(res.json.ingredients, [{ name: 'Stock', quantity: 2, unit: 'cup' }], 'ingredients');
});

await test('update: unknown id is 404, missing id is 400, rules apply (422)', async () => {
  expectError(await call('POST', '/api/recipes/update', { id: '99999', title: 'x' }), 404, 'DATA_NOT_FOUND', { resource: 'recipe', id: '99999' });
  expectError(await call('POST', '/api/recipes/update', { title: 'x' }), 400, 'VALIDATION_MISSING_PARAMETER', { parameter: 'id' });
  const e = expectError(await call('POST', '/api/recipes/update', { id: createdId, title: '', servings: 0 }), 422, 'VALIDATION_INVALID_INPUT');
  equal(e.fields, [{ code: 'NotBlank', path: 'title', value: '' }, { code: 'Min', path: 'servings', value: 0 }], 'fields');
});

await test('create: all violations are listed with path and value, in field order', async () => {
  const body = valid();
  body.title = '   ';
  body.servings = 101;
  body.difficulty = 'impossible';
  body.ingredients[1].quantity = 0;
  body.instructions[0].description = '';
  body.nutrition.fat = -1;
  delete body.author;
  const e = expectError(await call('POST', '/api/recipes/create', body), 422, 'VALIDATION_INVALID_INPUT', {});
  equal(e.fields, [
    { code: 'NotBlank', path: 'title', value: '   ' },
    { code: 'Max', path: 'servings', value: 101 },
    { code: 'Pattern', path: 'difficulty', value: 'impossible' },
    { code: 'Min', path: 'ingredients[1].quantity', value: 0 },
    { code: 'NotBlank', path: 'instructions[0].description', value: '' },
    { code: 'Min', path: 'nutrition.fat', value: -1 },
    { code: 'NotBlank', path: 'author', value: null },
  ], 'fields');
});

await test('create: missing required fields are NotNull (NotBlank for strings)', async () => {
  const e = expectError(await call('POST', '/api/recipes/create', {}), 422, 'VALIDATION_INVALID_INPUT');
  const codes = Object.fromEntries(e.fields.map((f) => [f.path, f.code]));
  equal(codes, {
    title: 'NotBlank', servings: 'NotNull', prepTime: 'NotNull', cookTime: 'NotNull', difficulty: 'NotBlank', cuisine: 'NotBlank',
    ingredients: 'NotNull', instructions: 'NotNull', nutrition: 'NotNull', author: 'NotBlank',
  }, 'codes by path');
  check(e.fields.every((f) => f.value === null), 'value is null for missing fields');
});

await test('create: size limits and empty lists', async () => {
  const body = valid();
  body.title = 'x'.repeat(121);
  body.ingredients = [];
  body.dietaryTags = Array(11).fill('a');
  const e = expectError(await call('POST', '/api/recipes/create', body), 422, 'VALIDATION_INVALID_INPUT');
  equal(e.fields.map((f) => [f.code, f.path]), [['Size', 'title'], ['Size', 'dietaryTags'], ['Size', 'ingredients']], 'fields');
});

await test('delete returns 204 without a body; the recipe is gone', async () => {
  const res = await call('POST', '/api/recipes/delete', { id: createdId });
  equal(res.status, 204, 'status');
  equal(res.text, '', 'no body');
  expectError(await call('GET', `/api/recipes/show?id=${createdId}`), 404, 'DATA_NOT_FOUND');
  expectError(await call('POST', '/api/recipes/delete', { id: createdId }), 404, 'DATA_NOT_FOUND');
  expectError(await call('POST', '/api/recipes/delete', {}), 400, 'VALIDATION_MISSING_PARAMETER', { parameter: 'id' });
});

await test('invalid JSON and non-object bodies are 400 VALIDATION_INVALID_JSON', async () => {
  expectError(await call('POST', '/api/recipes/create', undefined, { raw: '{oops' }), 400, 'VALIDATION_INVALID_JSON');
  expectError(await call('POST', '/api/recipes/create', undefined, { raw: '[1,2]' }), 400, 'VALIDATION_INVALID_JSON');
  expectError(await call('POST', '/api/recipes/create', undefined, { raw: '' }), 400, 'VALIDATION_INVALID_JSON');
});

await test('POST without JSON content type is 415, oversized body is 413', async () => {
  expectError(await call('POST', '/api/recipes/create', undefined, { contentType: 'text/plain', raw: 'x' }), 415, 'UNSUPPORTED_MEDIA_TYPE');
  expectError(await call('POST', '/api/recipes/create', undefined, { raw: JSON.stringify({ title: 'x'.repeat(300 * 1024) }) }), 413, 'PAYLOAD_TOO_LARGE');
});

await test('wrong method is 405, unknown path is 404', async () => {
  expectError(await call('POST', '/api/recipes', {}), 405, 'VALIDATION_METHOD_NOT_ALLOWED');
  expectError(await call('GET', '/api/recipes/create'), 405, 'VALIDATION_METHOD_NOT_ALLOWED');
  expectError(await call('GET', '/api/recipes/show-all'), 404, 'DATA_NOT_FOUND');
});

await test('search: text matches title, description, cuisine, ingredients and dietary tags', async () => {
  const q = async (query) => ids(await call('GET', `/api/recipes/search?query=${encodeURIComponent(query)}`));
  equal(await q('tikka'), ['1'], 'title');
  equal(await q('  CARBONARA '), ['2'], 'trimmed, case-insensitive');
  equal(await q('parmesan'), ['2'], 'ingredient');
  equal(await q('gluten'), ['1'], 'dietary tag');
  equal(await q('british'), ['3'], 'cuisine');
  equal(await q('roman pasta'), ['2'], 'description');
  equal(await q('zzzz'), [], 'no match');
  equal((await q('')).filter((i) => ['1', '2', '3'].includes(i)), ['1', '2', '3'], 'empty query');
});

await test('search: filters', async () => {
  const get = async (qs) => ids(await call('GET', `/api/recipes/search?${qs}`)).filter((i) => ['1', '2', '3'].includes(i));
  equal(await get('cuisine=Italian'), ['2'], 'cuisine');
  equal(await get('difficulty=hard'), ['3'], 'difficulty');
  equal(await get('maxCookTime=45'), ['1', '2'], 'maxCookTime');
  equal(await get('maxCookTime=0'), ['1', '2', '3'], 'maxCookTime 0 = no limit');
  equal(await get('cuisine=&difficulty=&maxCookTime='), ['1', '2', '3'], 'empty values are absent');
  equal(await get('cuisine=Indian&difficulty=medium&maxCookTime=45'), ['1'], 'combined');
});

await test('search: sort', async () => {
  const get = async (qs) => ids(await call('GET', `/api/recipes/search?${qs}`)).filter((i) => ['1', '2', '3'].includes(i));
  equal(await get('sort=cookTime'), ['2', '1', '3'], 'cookTime');
  equal(await get('sort=title'), ['3', '1', '2'], 'title');
  equal(await get('sort=rating'), [...seed].sort((a, b) => average(b) - average(a) || Number(a.id) - Number(b.id)).map((r) => r.id), 'rating');
  equal(await get('sort=relevance'), ['1', '2', '3'], 'relevance without query is id order');
});

await test('search: values that do not fit are 400 VALIDATION_TYPE_MISMATCH', async () => {
  expectError(await call('GET', '/api/recipes/search?difficulty=extreme'), 400, 'VALIDATION_TYPE_MISMATCH', { parameter: 'difficulty' });
  expectError(await call('GET', '/api/recipes/search?sort=best'), 400, 'VALIDATION_TYPE_MISMATCH', { parameter: 'sort' });
  expectError(await call('GET', '/api/recipes/search?maxCookTime=soon'), 400, 'VALIDATION_TYPE_MISMATCH', { parameter: 'maxCookTime' });
  expectError(await call('GET', '/api/recipes/search?maxCookTime=-5'), 400, 'VALIDATION_TYPE_MISMATCH', { parameter: 'maxCookTime' });
});

console.log(`\n${passed} passed, ${failures.length} failed`);
process.exit(failures.length ? 1 : 0);
