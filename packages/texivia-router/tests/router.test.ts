import { describe, it, expect } from 'vitest';
import { Router } from '../src/texivia';

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

  // =========================================================================
  // BUG #6: Empty config array creates router with null _mapping
  // that silently fails on all navigations
  // =========================================================================
  describe('Bug #6: Empty config produces silently broken router', () => {
    it('new Router() creates instance but _mapping is null', () => {
      const router = new Router();
      expect(router).toBeInstanceOf(Router);
      // Internal state: _mapping is null, all matches will return null
      // This is arguably a bug — should it throw or warn?
    });

    it('new Router([]) creates instance but _mapping is null', () => {
      const router = new Router([]);
      expect(router).toBeInstanceOf(Router);
    });

    it('empty router match always returns null without crashing', () => {
      const router = new Router([]);
      const match = (router as any)._match('/anything', {}, '');
      expect(match).toBeNull();
    });

    // SUGGESTION: Constructor should throw for empty config,
    // similar to how the full router does:
    //   if (mappings.length === 0)
    //     throw new Error('Texivia error: no routes were specified');
    //
    // Uncomment after implementing the guard:
    // it('should throw on empty config', () => {
    //   expect(() => new Router([])).toThrow();
    // });
  });

  // =========================================================================
  // BUG #2: _goto is public with underscore prefix + has console.log
  // =========================================================================
  describe('Bug #2 (resolved): _goto removed', () => {
    it('_goto method no longer exists', () => {
      const router = new Router([{ path: '/home', view: 'HomeView' }]);
      expect((router as any)._goto).toBeUndefined();
    });
  });

  // =========================================================================
  // BUG #10 (RESOLVED): ConfigRoute<T> no longer uses intersection type.
  // view is now an explicit property, no collision possible.
  // =========================================================================
  describe('Bug #10 (resolved): Explicit view property', () => {
    it('view property is cleanly separated from router internals', () => {
      // With the new type, T is only on the view property.
      // No collision between T's properties and path/redirect/handler.
      const router = new Router([
        { path: '/home', view: { component: 'HomeView', path: '/my-custom' } }
      ]);

      const match = (router as any)._match('/home', {}, '');
      expect(match).not.toBeNull();
      expect(match?.event.view).toEqual({ component: 'HomeView', path: '/my-custom' });
      expect(match?.event.path).toBe('/home'); // router's path, not view's path
    });

    it('view can be any type — component, string, object', () => {
      const componentRef = { render: () => 'html' };
      const router = new Router([
        { path: '/a', view: 'StringView' },
        { path: '/b', view: componentRef },
        { path: '/c', view: 42 },
        { path: '/d', view: null },
      ]);

      expect((router as any)._match('/a', {}, '')?.event.view).toBe('StringView');
      expect((router as any)._match('/b', {}, '')?.event.view).toBe(componentRef);
      expect((router as any)._match('/c', {}, '')?.event.view).toBe(42);
      expect((router as any)._match('/d', {}, '')?.event.view).toBeNull();
    });

    it('redirect routes can omit view', () => {
      const router = new Router([
        { path: '/old', redirect: '/new' },
        { path: '/new', view: 'NewView' },
      ]);

      const match = (router as any)._match('/old', {}, '');
      expect(match).not.toBeNull();
      expect(match?.event.view).toBeUndefined();
      expect(match?.redirect).toBe('/new');
    });
  });

  // =========================================================================
  // Constructor robustness
  // =========================================================================
  describe('Constructor robustness', () => {
    it('handles root path /', () => {
      const router = new Router([{ path: '/', view: 'RootView' }]);
      expect(router).toBeInstanceOf(Router);

      const match = (router as any)._match('/', {}, '');
      expect(match).not.toBeNull();
      expect(match?.event.view).toBe('RootView');
    });

    it('handles deeply nested paths', () => {
      const router = new Router([
        { path: '/a/b/c/d/e/f', view: 'DeepView' }
      ]);

      const match = (router as any)._match('/a/b/c/d/e/f', {}, '');
      expect(match).not.toBeNull();
    });

    it('handles routes with only redirect, no view', () => {
      const router = new Router([
        { path: '/old', redirect: '/new' },
        { path: '/new', view: 'NewView' }
      ]);

      expect(router).toBeInstanceOf(Router);
    });

    it('handles single wildcard-only config', () => {
      const router = new Router([
        { path: '*', view: 'CatchAll' }
      ]);

      const match = (router as any)._match('/literally/anything', {}, '');
      expect(match).not.toBeNull();
      expect(match?.event.view).toBe('CatchAll');
    });

    it('compiles regex with special characters in literal segments', () => {
      // Segments with characters that need regex escaping
      const router = new Router([
        { path: '/api/v1.0', view: 'ApiView' }
      ]);

      const match = (router as any)._match('/api/v1.0', {}, '');
      expect(match).not.toBeNull();

      // The dot should be escaped in regex — /api/v1X0 should NOT match
      const noMatch = (router as any)._match('/api/v1X0', {}, '');
      expect(noMatch).toBeNull();
    });
  });
});
