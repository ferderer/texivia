import { component } from 'texivia-component';

export const NotFound = component({
  template: () => `
    <section class="page">
      <h1>404</h1>
      <p>Page not found.</p>
      <p><a href="/">← Home</a></p>
    </section>
  `,
});
