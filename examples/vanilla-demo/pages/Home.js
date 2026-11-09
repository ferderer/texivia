import { component } from 'texivia-component';

export const Home = component({
  template: () => `
    <section class="page">
      <h1>Texivia Ecosystem Demo</h1>
      <p>Router + reactive state + components. 8.7 kB transferred. 18 ms DOMContentLoaded.</p>
      <nav class="demo-nav">
        <a href="/counter">Counter →</a>
        <a href="/recipe/42">Recipe detail →</a>
        <a href="/contact">Contact form →</a>
      </nav>
    </section>
  `,
});
