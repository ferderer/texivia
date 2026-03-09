import { Router } from 'texivia-router';
import type { Component } from 'svelte';
import Landing from './pages/Landing.svelte';
import Login from './pages/Login.svelte';
import UserProfile from './pages/UserProfile.svelte';
import About from './pages/About.svelte';
import Imprint from './pages/Imprint.svelte';
import Contact from './pages/Contact.svelte';
import NotFound from './pages/NotFound.svelte';

export const router = new Router<Component<any>>([
  { path: '/', handler: () => `/${navigator.language}/` },
  { path: '/{locale}/', view: Landing },
  { path: '/{locale}/login', view: Login },
  { path: '/{locale}/users/{id:\\d+}/profile', view: UserProfile },
  { path: '/{locale}/about', view: About },
  { path: '/{locale}/imprint', view: Imprint },
  { path: '/{locale}/contact', view: Contact },
  { path: '*', view: NotFound },
]);
