import { Router } from 'texivia-router';
import type { Component } from 'vue';
import Landing from './pages/Landing.vue';
import Login from './pages/Login.vue';
import UserProfile from './pages/UserProfile.vue';
import About from './pages/About.vue';
import Imprint from './pages/Imprint.vue';
import Contact from './pages/Contact.vue';
import NotFound from './pages/NotFound.vue';

export const router = new Router<Component>([
  { path: '/', handler: () => `/${navigator.language}/` },
  { path: '/{locale}/', view: Landing },
  { path: '/{locale}/login', view: Login },
  { path: '/{locale}/users/{id:\\d+}/profile', view: UserProfile },
  { path: '/{locale}/about', view: About },
  { path: '/{locale}/imprint', view: Imprint },
  { path: '/{locale}/contact', view: Contact },
  { path: '*', view: NotFound },
]);
