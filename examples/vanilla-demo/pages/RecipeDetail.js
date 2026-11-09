import { component } from 'texivia-component';
import { apiFetch }  from 'texivia-fetch';

// Simulated API — swap for real endpoint
const MOCK = {
  42: { title: 'Spaghetti Carbonara', time: '20 min', servings: 2 },
   7: { title: 'Avocado Toast',       time: '10 min', servings: 1 },
};

export const RecipeDetail = component({
  state: { recipe: null, error: null, loading: true },

  template: ({ recipe, error, loading, id }) => {
    if (loading) return `<section class="page"><p>Loading…</p></section>`;
    if (error)   return `
      <section class="page">
        <p class="error">Failed to load recipe (${error}).</p>
        <p><a href="/">← Back</a></p>
      </section>`;
    if (!recipe) return `
      <section class="page">
        <h1>Recipe not found</h1>
        <p><a href="/">← Back</a></p>
      </section>`;
    return `
      <section class="page">
        <h1>${recipe.title}</h1>
        <dl>
          <dt>Time</dt>    <dd>${recipe.time}</dd>
          <dt>Servings</dt><dd>${recipe.servings}</dd>
        </dl>
        <p class="back"><a href="/">← Back</a></p>
      </section>`;
  },

  // afterRender fires after the first render — use it for async data loading.
  // ctx.signal is aborted automatically on unmount (navigation away).
  afterRender(_, ctx) {
    if (!ctx.state.loading) return;  // already loaded
    const id = (ctx.props as { id?: string }).id ?? '';

    // Real usage: apiFetch(`/api/recipe/${id}`, null, { method: 'GET', signal: ctx.signal })
    // Here we simulate with a short timeout that respects the abort signal.
    const timer = setTimeout(() => {
      if (ctx.signal.aborted) return;
      const recipe = (MOCK as Record<string, unknown>)[id] ?? null;
      ctx.batch(() => {
        ctx.state.recipe  = recipe as never;
        ctx.state.loading = false as never;
      });
    }, 300);

    ctx.signal.addEventListener('abort', () => clearTimeout(timer));
  },
});
