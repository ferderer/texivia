import { component } from 'texivia-component';

export const Counter = component({
  state: { count: 0 },
  template: ({ count }) => `
    <section class="page">
      <h1>Counter</h1>
      <p class="counter-value">${count}</p>
      <div class="counter-controls">
        <button @click="dec">−</button>
        <button @click="reset">Reset</button>
        <button @click="inc">+</button>
      </div>
      <p class="back"><a href="/">← Back</a></p>
    </section>
  `,
  inc(ctx)   { ctx.state.count++;  },
  dec(ctx)   { ctx.state.count--;  },
  reset(ctx) { ctx.state.count = 0; },
});
