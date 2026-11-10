#!/usr/bin/env node
// Reference implementation of API.md: in memory, no dependencies (Node 20+).
//   node reference-server.mjs            # http://localhost:8080
//   PORT=9000 node reference-server.mjs
// Lets the Recipe Builder apps run without the real backend, and is the check for contract-test.mjs.
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';

const seed = JSON.parse(readFileSync(new URL('./seed.json', import.meta.url), 'utf8'));
const MAX_BODY = 256 * 1024;
const DIFFICULTIES = ['easy', 'medium', 'hard'];
const SORTS = ['relevance', 'rating', 'cookTime', 'title'];

// ─── Errors (Guard4j response, see API.md) ────────────────────────────────────

const ERRORS = {
  DATA_NOT_FOUND:                  [404, 'BUSINESS',   'INFO',  'Requested resource not found'],
  VALIDATION_INVALID_INPUT:        [422, 'VALIDATION', 'WARN',  'Input validation failed'],
  VALIDATION_MISSING_PARAMETER:    [400, 'VALIDATION', 'WARN',  'Required request parameter is missing'],
  VALIDATION_TYPE_MISMATCH:        [400, 'VALIDATION', 'WARN',  'Parameter type mismatch'],
  VALIDATION_INVALID_JSON:         [400, 'VALIDATION', 'WARN',  'Invalid JSON format in request body'],
  VALIDATION_METHOD_NOT_ALLOWED:   [405, 'VALIDATION', 'WARN',  'HTTP method not allowed for this endpoint'],
  UNSUPPORTED_MEDIA_TYPE:          [415, 'VALIDATION', 'INFO',  'Content type is not supported'],
  PAYLOAD_TOO_LARGE:               [413, 'VALIDATION', 'INFO',  'Request payload is too large'],
  INTERNAL_SERVER_ERROR:           [500, 'INTERNAL',   'ERROR', 'Internal server error occurred'],
};

class ApiException extends Error {
  constructor(name, data = {}, fields = null) { super(name); this.errorName = name; this.data = data; this.fields = fields; }
}

function send(res, status, body) {
  const text = body === undefined ? '' : JSON.stringify(body);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(text);
}

function sendError(res, e) {
  const [status, category, severity, message] = ERRORS[e.errorName];
  send(res, status, {
    timestamp: Date.now(),
    status,
    error: {
      name: e.errorName,
      code: e.errorName.toLowerCase().replaceAll('_', '-'),
      message,
      category,
      httpStatus: status,
      severity,
    },
    data: e.data,
    fields: e.fields,
  });
}

// ─── Validation ───────────────────────────────────────────────────────────────

const isObj = (v) => typeof v === 'object' && v !== null && !Array.isArray(v);
const isInt = (v) => Number.isInteger(v);

function validate(input, { create }) {
  const out = [];
  const has = (k) => create || Object.hasOwn(input, k);
  const add = (code, path, value) => out.push({ code, path, value: value === undefined ? null : value });

  const str = (path, v, { min = 0, max, required = true }) => {
    if (typeof v !== 'string') { if (required) add(min > 0 ? 'NotBlank' : 'NotNull', path, v); return; }
    if (min > 0 && v.trim() === '') add('NotBlank', path, v);
    else if (v.length < min || v.length > max) add('Size', path, v);
  };
  const int = (path, v, min, max) => {
    if (!isInt(v)) return add('NotNull', path, v);
    if (v < min) add('Min', path, v); else if (v > max) add('Max', path, v);
  };

  if (has('title'))       str('title', input.title, { min: 1, max: 120 });
  if (has('description')) { if (input.description !== undefined || !create) str('description', input.description, { max: 2000 }); }
  if (has('servings'))    int('servings', input.servings, 1, 100);
  if (has('prepTime'))    int('prepTime', input.prepTime, 0, 10000);
  if (has('cookTime'))    int('cookTime', input.cookTime, 0, 10000);
  if (has('difficulty'))  { if (typeof input.difficulty !== 'string') add('NotBlank', 'difficulty', input.difficulty); else if (!DIFFICULTIES.includes(input.difficulty)) add('Pattern', 'difficulty', input.difficulty); }
  if (has('cuisine'))     str('cuisine', input.cuisine, { min: 1, max: 60 });

  if (has('dietaryTags') && (input.dietaryTags !== undefined || !create)) {
    const t = input.dietaryTags;
    if (!Array.isArray(t)) add('NotNull', 'dietaryTags', t);
    else if (t.length > 10) add('Size', 'dietaryTags', t);
    else t.forEach((x, i) => { if (typeof x !== 'string' || x.length < 1 || x.length > 30) add('Size', `dietaryTags[${i}]`, x); });
  }

  if (has('ingredients')) {
    const list = input.ingredients;
    if (!Array.isArray(list)) add('NotNull', 'ingredients', list);
    else if (list.length < 1 || list.length > 100) add('Size', 'ingredients', list);
    else list.forEach((x, i) => {
      const p = `ingredients[${i}]`;
      if (!isObj(x)) return add('NotNull', p, x);
      str(`${p}.name`, x.name, { min: 1, max: 100 });
      if (typeof x.quantity !== 'number' || !Number.isFinite(x.quantity)) add('NotNull', `${p}.quantity`, x.quantity);
      else if (x.quantity <= 0) add('Min', `${p}.quantity`, x.quantity);
      if (x.unit !== undefined) str(`${p}.unit`, x.unit, { max: 30 });
      if (x.notes !== undefined) str(`${p}.notes`, x.notes, { max: 200 });
    });
  }

  if (has('instructions')) {
    const list = input.instructions;
    if (!Array.isArray(list)) add('NotNull', 'instructions', list);
    else if (list.length < 1 || list.length > 100) add('Size', 'instructions', list);
    else list.forEach((x, i) => {
      const p = `instructions[${i}]`;
      if (!isObj(x)) return add('NotNull', p, x);
      if (!isInt(x.step)) add('NotNull', `${p}.step`, x.step); else if (x.step < 1) add('Min', `${p}.step`, x.step);
      str(`${p}.description`, x.description, { min: 1, max: 1000 });
      if (x.duration !== undefined) int(`${p}.duration`, x.duration, 0, 10000);
      if (x.image !== undefined) str(`${p}.image`, x.image, { max: 300 });
    });
  }

  if (has('nutrition')) {
    const n = input.nutrition;
    if (!isObj(n)) add('NotNull', 'nutrition', n);
    else for (const k of ['calories', 'protein', 'carbs', 'fat', 'fiber', 'sugar']) {
      if (typeof n[k] !== 'number' || !Number.isFinite(n[k])) add('NotNull', `nutrition.${k}`, n[k]);
      else if (n[k] < 0) add('Min', `nutrition.${k}`, n[k]);
    }
  }

  if (has('images') && (input.images !== undefined || !create)) {
    const t = input.images;
    if (!Array.isArray(t)) add('NotNull', 'images', t);
    else if (t.length > 10) add('Size', 'images', t);
    else t.forEach((x, i) => { if (typeof x !== 'string' || x.length < 1 || x.length > 300) add('Size', `images[${i}]`, x); });
  }

  if (create) str('author', input.author, { min: 1, max: 80 });
  return out;
}

// ─── Storage and logic ────────────────────────────────────────────────────────

const now = () => new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
const recipes = new Map(seed.map((r) => [r.id, structuredClone(r)]));
const byId = (a, b) => Number(a.id) - Number(b.id);
const all = () => [...recipes.values()].sort(byId);
const average = (r) => r.ratings.length ? r.ratings.reduce((s, x) => s + x, 0) / r.ratings.length : 0;
const nextId = () => String(Math.max(0, ...[...recipes.keys()].map(Number)) + 1);
const MUTABLE = ['title', 'description', 'servings', 'prepTime', 'cookTime', 'difficulty', 'cuisine', 'dietaryTags', 'ingredients', 'instructions', 'nutrition', 'images'];

function search(params) {
  const get = (k) => params.get(k) || '';
  const difficulty = get('difficulty');
  if (difficulty && !DIFFICULTIES.includes(difficulty)) throw new ApiException('VALIDATION_TYPE_MISMATCH', { parameter: 'difficulty' });
  const sort = get('sort') || 'relevance';
  if (!SORTS.includes(sort)) throw new ApiException('VALIDATION_TYPE_MISMATCH', { parameter: 'sort' });
  const max = get('maxCookTime');
  if (max && !/^\d+$/.test(max)) throw new ApiException('VALIDATION_TYPE_MISMATCH', { parameter: 'maxCookTime' });

  const q = get('query').trim().toLowerCase();
  const cuisine = get('cuisine');
  let list = all().filter((r) =>
    (!q || [r.title, r.description, r.cuisine, ...r.ingredients.map((i) => i.name), ...r.dietaryTags].some((s) => s.toLowerCase().includes(q)))
    && (!cuisine || r.cuisine === cuisine)
    && (!difficulty || r.difficulty === difficulty)
    && (!Number(max) || r.cookTime <= Number(max)));

  const titleHit = (r) => (q && r.title.toLowerCase().includes(q) ? 0 : 1);
  const cmp = {
    relevance: (a, b) => titleHit(a) - titleHit(b),
    rating:    (a, b) => average(b) - average(a),
    cookTime:  (a, b) => a.cookTime - b.cookTime,
    title:     (a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase(), 'en'),
  }[sort];
  return list.sort((a, b) => cmp(a, b) || byId(a, b));
}

// ─── HTTP ─────────────────────────────────────────────────────────────────────

async function readJson(req) {
  if (!/^application\/json\b/i.test(req.headers['content-type'] ?? '')) throw new ApiException('UNSUPPORTED_MEDIA_TYPE');
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY) throw new ApiException('PAYLOAD_TOO_LARGE');
    chunks.push(chunk);
  }
  let body;
  try { body = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw new ApiException('VALIDATION_INVALID_JSON'); }
  if (!isObj(body)) throw new ApiException('VALIDATION_INVALID_JSON');
  return body;
}

function requireId(id) {
  if (typeof id !== 'string' || id === '') throw new ApiException('VALIDATION_MISSING_PARAMETER', { parameter: 'id' });
  const recipe = recipes.get(id);
  if (!recipe) throw new ApiException('DATA_NOT_FOUND', { resource: 'recipe', id });
  return recipe;
}

const ROUTES = {
  '/api/recipes':         { GET: () => ({ status: 200, body: all() }) },
  '/api/recipes/show':    { GET: (_b, url) => ({ status: 200, body: requireId(url.searchParams.get('id')) }) },
  '/api/recipes/search':  { GET: (_b, url) => ({ status: 200, body: search(url.searchParams) }) },
  '/api/recipes/create':  { POST: (body) => {
    const fields = validate(body, { create: true });
    if (fields.length) throw new ApiException('VALIDATION_INVALID_INPUT', {}, fields);
    const stamp = now();
    const recipe = {
      id: nextId(), title: body.title, description: body.description ?? '', servings: body.servings,
      prepTime: body.prepTime, cookTime: body.cookTime, difficulty: body.difficulty, cuisine: body.cuisine,
      dietaryTags: body.dietaryTags ?? [],
      ingredients: body.ingredients.map((i) => ({ name: i.name, quantity: i.quantity, unit: i.unit ?? '', ...(i.notes !== undefined && { notes: i.notes }) })),
      instructions: body.instructions.map((i) => ({ step: i.step, description: i.description, ...(i.duration !== undefined && { duration: i.duration }), ...(i.image !== undefined && { image: i.image }) })),
      nutrition: Object.fromEntries(['calories', 'protein', 'carbs', 'fat', 'fiber', 'sugar'].map((k) => [k, body.nutrition[k]])),
      images: body.images ?? [], author: body.author, ratings: [], createdAt: stamp, updatedAt: stamp,
    };
    recipes.set(recipe.id, recipe);
    return { status: 201, body: recipe };
  } },
  '/api/recipes/update':  { POST: (body) => {
    const recipe = requireId(body.id);
    const fields = validate(body, { create: false });
    if (fields.length) throw new ApiException('VALIDATION_INVALID_INPUT', {}, fields);
    for (const k of MUTABLE) if (Object.hasOwn(body, k)) recipe[k] = body[k];
    recipe.updatedAt = now();
    return { status: 200, body: recipe };
  } },
  '/api/recipes/delete':  { POST: (body) => { requireId(body.id); recipes.delete(body.id); return { status: 204 }; } },
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const route = ROUTES[url.pathname];
    if (!route) throw new ApiException('DATA_NOT_FOUND');
    const handler = route[req.method];
    if (!handler) throw new ApiException('VALIDATION_METHOD_NOT_ALLOWED');
    const body = req.method === 'POST' ? await readJson(req) : undefined;
    const { status, body: payload } = handler(body, url);
    send(res, status, payload);
  } catch (e) {
    if (e instanceof ApiException) return sendError(res, e);
    console.error(e);
    sendError(res, new ApiException('INTERNAL_SERVER_ERROR'));
  }
});

const port = Number(process.env.PORT) || 8080;
server.listen(port, () => console.log(`Recipe API (reference) on http://localhost:${port}`));
