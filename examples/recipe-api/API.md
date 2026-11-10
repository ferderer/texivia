# Recipe API v1

The contract between the Recipe Builder apps (`examples/svelte/recipe-builder`, `examples/vue/recipe-builder`) and a backend. Any backend that follows this document works; the intended one is a small Evelikto (PHP) app. `reference-server.mjs` is a dependency-free Node implementation, and `contract-test.mjs` checks a running server against this document.

* JSON, UTF-8. Paths are below `/api`, same origin as the app (in development the Vite dev server proxies `/api` to the backend on port 8080), so no CORS and no cookies are needed.
* Reads are `GET` with query parameters, writes are `POST` with a JSON body (`Content-Type: application/json`).
* Errors use the response of [Guard4j](https://github.com/ferderer/guard4j); the part this API needs is described under "Errors".
* No authentication. The login, register and dashboard pages of the apps are mock-ups; `author` is a plain string the client sends.

## Endpoints

| Call | Method and path | Request | Success |
|---|---|---|---|
| list | `GET /api/recipes` | – | `200`, array of recipes in `id` order |
| show | `GET /api/recipes/show?id={id}` | query `id` | `200`, recipe |
| create | `POST /api/recipes/create` | recipe without `id`, `createdAt`, `updatedAt` | `201`, the created recipe |
| update | `POST /api/recipes/update` | `{ "id": "…", …fields to change }` | `200`, the updated recipe |
| delete | `POST /api/recipes/delete` | `{ "id": "…" }` | `204`, no body |
| search | `GET /api/recipes/search?query=…` | query parameters, all optional | `200`, array of recipes |

A path that does not exist is `404 DATA_NOT_FOUND`; a known path with the wrong method is `405 VALIDATION_METHOD_NOT_ALLOWED`. A `.php` suffix or `Allow` header is up to the backend and not part of the contract.

## Recipe

```json
{
  "id": "1",
  "title": "Chicken Tikka Masala",
  "description": "Creamy and flavorful Indian curry with tender chicken pieces",
  "servings": 4,
  "prepTime": 30,
  "cookTime": 45,
  "difficulty": "medium",
  "cuisine": "Indian",
  "dietaryTags": ["gluten-free"],
  "ingredients": [{ "name": "Chicken breast", "quantity": 1, "unit": "lb", "notes": "optional" }],
  "instructions": [{ "step": 1, "description": "Cut chicken into bite-sized pieces", "duration": 5, "image": "optional" }],
  "nutrition": { "calories": 380, "protein": 32, "carbs": 12, "fat": 24, "fiber": 3, "sugar": 8 },
  "images": ["/_/images/chicken-tikka-masala.jpg"],
  "author": "Chef Priya",
  "ratings": [5, 4, 5, 4, 5],
  "createdAt": "2024-01-15T00:00:00Z",
  "updatedAt": "2024-01-15T00:00:00Z"
}
```

| Field | Type | Rule | Code on violation |
|---|---|---|---|
| `id` | string | assigned by the server, opaque (the seed uses `"1"`, `"2"`, `"3"`, new ones count on) | – |
| `title` | string | 1–120 characters, not blank | `NotBlank`, `Size` |
| `description` | string | 0–2000 characters | `Size` |
| `servings` | integer | 1–100 | `Min`, `Max` |
| `prepTime`, `cookTime` | integer, minutes | 0–10000 | `Min`, `Max` |
| `difficulty` | string | `easy`, `medium` or `hard` | `Pattern` |
| `cuisine` | string | 1–60 characters, not blank | `NotBlank`, `Size` |
| `dietaryTags` | array of strings | at most 10 entries of 1–30 characters | `Size` |
| `ingredients` | array | 1–100 entries | `Size` |
| `ingredients[].name`, `.unit` | string | `name` not blank, 1–100 characters; `unit` 0–30 characters | `NotBlank`, `Size` |
| `ingredients[].quantity` | number | greater than 0 | `Min` |
| `ingredients[].notes` | string, optional | 0–200 characters | `Size` |
| `instructions` | array | 1–100 entries | `Size` |
| `instructions[].step` | integer | 1 or more; the server does not renumber | `Min` |
| `instructions[].description` | string | not blank, 1–1000 characters | `NotBlank`, `Size` |
| `instructions[].duration` | integer, optional | 0–10000 minutes | `Min`, `Max` |
| `instructions[].image` | string, optional | 0–300 characters | `Size` |
| `nutrition` | object | the six numbers are required, each 0 or more | `NotNull`, `Min` |
| `images` | array of strings | 0–10 entries of 1–300 characters; site-relative paths or URLs, no upload | `Size` |
| `author` | string | 1–80 characters, not blank | `NotBlank`, `Size` |
| `ratings` | array of integers 1–5 | read-only: `[]` for a new recipe, ignored when sent | – |
| `createdAt`, `updatedAt` | string | ISO 8601 UTC, set by the server, ignored when sent | – |

Required on `create`: `title`, `servings`, `prepTime`, `cookTime`, `difficulty`, `cuisine`, `ingredients`, `instructions`, `nutrition`, `author`. Optional, with default: `description` (`""`), `dietaryTags` (`[]`), `images` (`[]`), `ingredients[].unit` (`""`). A required field that is missing, `null` or of the wrong type is a violation with the code `NotNull` (`NotBlank` for strings), and its `value` is what was sent (`null` if missing).

Unknown fields are ignored. `update` takes any subset of `title`, `description`, `servings`, `prepTime`, `cookTime`, `difficulty`, `cuisine`, `dietaryTags`, `ingredients`, `instructions`, `nutrition`, `images`; the same rules apply to the fields that are sent (arrays and objects are replaced as a whole). `author`, `ratings`, `createdAt` and `updatedAt` cannot be changed. A successful `update` sets `updatedAt`. `list` and `search` return complete recipes.

## Search

`GET /api/recipes/search`, all parameters optional:

| Parameter | Meaning |
|---|---|
| `query` | trimmed, case-insensitive substring in `title`, `description`, `cuisine`, any ingredient `name` or any `dietaryTags` entry; empty means no text filter |
| `cuisine` | exact match |
| `difficulty` | `easy`, `medium` or `hard` |
| `maxCookTime` | integer; `cookTime` at most this value; `0` or absent means no limit |
| `sort` | `relevance` (default: recipes whose title contains `query` first, then `id` order), `rating` (average rating, highest first, no ratings count as 0), `cookTime` (lowest first), `title` (case-insensitive, A to Z) |

An empty value counts as an absent parameter. Ties are broken by `id` (numeric order). A value that does not fit (`difficulty` or `sort` not in the list, `maxCookTime` not a non-negative integer) is `400 VALIDATION_TYPE_MISMATCH` with `data.parameter`.

## Errors

Every error is the Guard4j response with the HTTP status as `status`, for example:

```json
{
  "timestamp": 1731240000000,
  "status": 422,
  "error": { "name": "VALIDATION_INVALID_INPUT", "code": "validation-invalid-input", "message": "Input validation failed",
             "category": "VALIDATION", "httpStatus": 422, "severity": "WARN" },
  "data": {},
  "fields": [{ "code": "NotBlank", "path": "title", "value": "" },
             { "code": "Min", "path": "ingredients[1].quantity", "value": 0 }]
}
```

`fields[].path` is the JSON path of the offending value (`title`, `ingredients[1].quantity`, `instructions[0].description`); `value` is the value that was sent (`null` if it was missing). Clients render by `error.name`; the other `error` fields may differ between backends.

| Situation | Status | `error.name` | `data` |
|---|---|---|---|
| unknown recipe `id` (show, update, delete) | 404 | `DATA_NOT_FOUND` | `{ "resource": "recipe", "id": "…" }` |
| unknown path | 404 | `DATA_NOT_FOUND` | `{}` |
| body violates the rules | 422 | `VALIDATION_INVALID_INPUT` | `{}`, with `fields` |
| `id` missing (show: query; update, delete: body) | 400 | `VALIDATION_MISSING_PARAMETER` | `{ "parameter": "id" }` |
| search parameter does not fit | 400 | `VALIDATION_TYPE_MISMATCH` | `{ "parameter": "…" }` |
| body is not valid JSON, or not an object | 400 | `VALIDATION_INVALID_JSON` | `{}` |
| wrong method | 405 | `VALIDATION_METHOD_NOT_ALLOWED` | `{}` |
| `POST` without `Content-Type: application/json` | 415 | `UNSUPPORTED_MEDIA_TYPE` | `{}` |
| body larger than 256 KiB | 413 | `PAYLOAD_TOO_LARGE` | `{}` |
| storage failure | 500 | `SYSTEM_DATABASE_ERROR` | `{}` |
| anything unexpected | 500 | `INTERNAL_SERVER_ERROR` | `{}` |

Order of checks: path and method (404, 405), `Content-Type` (415), body size (413), JSON (400), `id` missing (400), unknown `id` (404), rules (422). If several rules are violated, all are listed in `fields`, in the order of the field table above. Server details (messages of exceptions, traces, paths) are never sent.

## Seed data

`seed.json` holds the three recipes the apps showed as mock data (ids `1` to `3`). A backend starts with exactly these when its storage is empty. They are the fixture of `contract-test.mjs`.

## Not in v1

Authentication and users, rating a recipe (`ratings` is read-only), image upload, pagination (the list is small; add `Page<T>` when it is needed), ETags and caching headers.
