import { describe, it, expect } from 'vitest';
import { Router } from '../src/texivia-micro';

describe('Router constructor', () => {
  it('creates a router with empty routes', () => {
    const router = new Router();
    expect(router).toBeInstanceOf(Router);
  });

  it('creates a router with valid routes', () => {
    const router = new Router([
      { path: '/', redirect: '/home' },
      { path: '/home', view: 'HomeView' },
      { path: '/users/{id}', handler: () => true },
      { path: '/posts/{postId:\\d+}', view: 'PostView' },
      { path: '*', view: 'NotFoundView' }
    ]);

    expect(router).toBeInstanceOf(Router);
  });

  it('handles catch-all routes correctly', () => {
    const router = new Router([
      { path: '*', view: 'NotFoundView' }
    ]);

    expect(router).toBeInstanceOf(Router);
  });

  it('accepts various parameter formats', () => {
    const router = new Router([
      { path: '/users/{id}', view: 'UserView' },
      { path: '/posts/{slug:[a-z0-9-]+}', view: 'PostView' },
      { path: '/products/{category}/{id:\\d+}', view: 'ProductView' }
    ]);

    expect(router).toBeInstanceOf(Router);
  });

  it('throws an error for malformed paths', () => {
    expect(() => {
      new Router([{ path: '/invalid{param' }]);
    }).toThrow('Malformed path: /invalid{param');

    expect(() => {
      new Router([{ path: '/missing-closing}/brace' }]);
    }).toThrow();

    expect(() => {
      new Router([{ path: 'no-leading-slash' }]);
    }).toThrow();
  });

  it('handles complex path patterns', () => {
    const router = new Router([
      { path: '/blog/{year:\\d{4}}/{month:\\d{2}}/{day:\\d{2}}/{slug:[a-z0-9-]+}', view: 'BlogPostView' },
      { path: '/api/{version:\\d+}/resources/{resourceId:[a-f0-9-]+}', view: 'ApiResourceView' }
    ]);

    expect(router).toBeInstanceOf(Router);
  });

  it('handles multiple routes with similar patterns', () => {
    const router = new Router([
      { path: '/users/{id}', view: 'UserView' },
      { path: '/users/new', view: 'NewUserView' },
      { path: '/users/{id}/edit', view: 'EditUserView' }
    ]);

    expect(router).toBeInstanceOf(Router);
  });
});
