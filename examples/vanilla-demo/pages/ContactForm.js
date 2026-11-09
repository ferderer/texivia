import { component } from 'texivia-component';

export const ContactForm = component({
  state: {
    name: '', email: '', message: '',
    size: 'M', newsletter: false, submitted: false,
  },

  template: ({ name, email, submitted }) => {
    if (submitted) return `
      <section class="page">
        <h1>Sent ✓</h1>
        <p>Thanks, <strong>${name}</strong>. We'll be in touch at ${email}.</p>
        <button @click="reset">Send another</button>
        <p class="back"><a href="/">← Back</a></p>
      </section>`;

    return `
      <section class="page">
        <h1>Contact</h1>

        <label>Name
          <input type="text" @bind="name" placeholder="Your name">
        </label>
        <label>Email
          <input type="email" @bind="email" placeholder="you@example.com">
        </label>
        <label>Message
          <textarea @bind="message" rows="4" placeholder="Say something…"></textarea>
        </label>

        <fieldset>
          <legend>T-shirt size</legend>
          <label><input type="radio" @bind="size" value="S"> S</label>
          <label><input type="radio" @bind="size" value="M"> M</label>
          <label><input type="radio" @bind="size" value="L"> L</label>
        </fieldset>

        <label class="checkbox-label">
          <input type="checkbox" @bind="newsletter"> Subscribe to newsletter
        </label>

        <button @click.prevent="submit">Send</button>
        <p class="back"><a href="/">← Back</a></p>
      </section>`;
  },

  submit(ctx) {
    if (!ctx.state.name || !ctx.state.email) return;
    ctx.state.submitted = true;
  },

  reset(ctx) {
    ctx.batch(() => {
      ctx.state.name       = '';
      ctx.state.email      = '';
      ctx.state.message    = '';
      ctx.state.size       = 'M';
      ctx.state.newsletter = false;
      ctx.state.submitted  = false;
    });
  },
});
