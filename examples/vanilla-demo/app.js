import { setupEvents } from 'texivia-component';
import { router }      from './router.js';

const app = document.getElementById('app');
let current = null;

document.addEventListener('texivia', ({ detail: { view, params } }) => {
  current?.unmount();
  app.innerHTML = '';
  current = view(params);
  current.mount(app);
});

setupEvents();
router.start();
