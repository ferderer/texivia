import { Router }       from 'texivia-router';
import { Home }         from './pages/Home.js';
import { Counter }      from './pages/Counter.js';
import { RecipeDetail } from './pages/RecipeDetail.js';
import { ContactForm }  from './pages/ContactForm.js';
import { NotFound }     from './pages/NotFound.js';

export const router = new Router([
  { path: '/',             view: Home         },
  { path: '/counter',      view: Counter      },
  { path: '/recipe/{id}',  view: RecipeDetail },
  { path: '/contact',      view: ContactForm  },
  { path: '*',             view: NotFound     },
]);
