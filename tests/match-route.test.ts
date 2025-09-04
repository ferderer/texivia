import { describe, it, expect } from 'vitest';
import { Router } from '../src/router';

// Define a minimal route config interface for testing
interface TestRouteConfig {
  path: string;
  name?: string; // Optional, added during compilation
}

describe('_matchRoute handling', () => {

  it('returns notFound for unmatched paths', () => {
    const router = new Router<TestRouteConfig>({
      Home: { path: '/home' },
      NotFound: { path: '*' },
    });
    const { route, params } = router._matchRoute('/invalid');
    expect(route.name).toEqual('NotFound');
  });

  it('matches a route without parameters', () => {
    const router = new Router<TestRouteConfig>({
      Home: { path: '/home' }
    });
    const { route, params } = router._matchRoute('/home');
    expect(route.path).toBe('/home');
    expect(params).toEqual({});
  });

  it('matches a route with parameters', () => {
    const router = new Router<TestRouteConfig>({
      Users: { path: '/users/{id}' }
    });
    const { route, params } = router._matchRoute('/users/123');
    expect(route.path).toBe('/users/{id}');
    expect(params).toEqual({ id: '123' });
  });

  it('correctly matches overlapping routes 1', () => {
    const router = new Router<TestRouteConfig>({
      Users: { path: '/users/{id:\\d+}' },
      NewUsers: { path: '/users/new' },
    });
    const { route, params } = router._matchRoute('/users/123');
    expect(route.path).toBe('/users/{id:\\d+}');
    expect(params).toEqual({ id: '123' });
  });

  it('correctly matches overlapping routes 2', () => {
    const router = new Router<TestRouteConfig>({
      Users: { path: '/users/{id:\\d+}' },
      NewUsers: { path: '/users/new' },
    });
    const { route, params } = router._matchRoute('/users/new');
    expect(route.path).toBe('/users/new');
    expect(params).toEqual({});
  });

  it('returns notFound for partial matches', () => {
    const router = new Router<TestRouteConfig>({
      Users: { path: '/users/{id}' },
      NotFound: { path: '*' },
    });
    const { route, params } = router._matchRoute('/users/');
    expect(route.name).toEqual('NotFound');
  });
});
