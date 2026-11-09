import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Router } from '../src/texivia';

// Mock browser APIs
const mockPushState = vi.fn();
const mockDispatchEvent = vi.fn();

describe('Router _navigate function', () => {
  // Setup before each test
  beforeEach(() => {
    // Save original implementations
    vi.stubGlobal('window', {
      ...window,
      history: {
        ...window.history,
        pushState: mockPushState
      },
      location: {
        ...window.location,
        origin: 'http://localhost'
      }
    });

    // Mock document methods
    document.dispatchEvent = mockDispatchEvent;

    // Clear mocks before each test
    mockPushState.mockClear();
    mockDispatchEvent.mockClear();
  });

  // Cleanup after tests
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Helper to access private method
  function navigate(router: Router, url: URL, pushState = true) {
    return (router as any)._navigate(url, pushState);
  }

  it('navigates to a basic route', async () => {
    const homeView = { name: 'HomeView' };
    const router = new Router([
      { path: '/home', view: homeView }
    ]);

    const url = new URL('http://localhost/home');
    const result = await navigate(router, url, true);

    expect(result).not.toBeNull();
    expect(result?.view).toBe(homeView);
    expect(mockPushState).toHaveBeenCalledWith({ path: '/home' }, '', url);
    expect(mockDispatchEvent).toHaveBeenCalled();

    const event = mockDispatchEvent.mock.calls[0][0];
    expect(event.type).toBe('texivia');
    expect(event.detail.view).toBe(homeView);
  });

  it('handles redirects', async () => {
    const homeView = { name: 'HomeView' };
    const router = new Router([
      { path: '/', redirect: '/home' },
      { path: '/home', view: homeView }
    ]);

    const url = new URL('http://localhost/');
    const result = await navigate(router, url, true);

    // Should end up at /home
    expect(result?.view).toBe(homeView);
    expect(mockPushState).toHaveBeenCalledWith({ path: '/home' }, '', expect.any(URL));
  });

  it('processes route handlers returning true', async () => {
    const handler = vi.fn().mockResolvedValue(true);

    const router = new Router([
      { path: '/handler', view: 'HandlerView', handler }
    ]);

    const url = new URL('http://localhost/handler');
    const result = await navigate(router, url, true);

    expect(handler).toHaveBeenCalled();
    expect(result?.view).toBe('HandlerView');
    expect(mockDispatchEvent).toHaveBeenCalled();
  });

  it('redirects to result from handler when string is returned', async () => {
    const homeView = { name: 'HomeView' };
    const handler = vi.fn().mockResolvedValue('/home');

    const router = new Router([
      { path: '/redirect-handler', handler },
      { path: '/home', view: homeView }
    ]);

    const url = new URL('http://localhost/redirect-handler');
    const result = await navigate(router, url, true);

    expect(handler).toHaveBeenCalled();
    expect(result?.view).toBe(homeView);
  });

  it('returns null when handler returns falsy value', async () => {
    const handler = vi.fn().mockResolvedValue(false);

    const router = new Router([
      { path: '/cancel', handler }
    ]);

    const url = new URL('http://localhost/cancel');
    const result = await navigate(router, url, true);

    expect(handler).toHaveBeenCalled();
    expect(result).toBeNull();
    expect(mockDispatchEvent).not.toHaveBeenCalled();
  });

  it('skips push state when pushState is false', async () => {
    const homeView = { name: 'HomeView' };
    const router = new Router([
      { path: '/home', view: homeView }
    ]);

    const url = new URL('http://localhost/home');
    const result = await navigate(router, url, false);

    expect(result).not.toBeNull();
    expect(mockPushState).not.toHaveBeenCalled();
    expect(mockDispatchEvent).toHaveBeenCalled();
  });

  it('returns null when no route matches', async () => {
    const router = new Router([
      { path: '/home', view: 'HomeView' }
    ]);

    const url = new URL('http://localhost/not-found');
    const result = await navigate(router, url, true);

    expect(result).toBeNull();
    expect(mockPushState).not.toHaveBeenCalled();
    expect(mockDispatchEvent).not.toHaveBeenCalled();
  });

  it('passes route params to handler', async () => {
    const handler = vi.fn().mockImplementation(match => {
      expect(match.params).toEqual({ id: '123' });
      expect(match.search).toEqual({ q: 'test' });
      expect(match.hash).toBe('#section');
      return true;
    });

    const router = new Router([
      { path: '/users/{id}', handler }
    ]);

    const url = new URL('http://localhost/users/123?q=test#section');
    await navigate(router, url, true);

    expect(handler).toHaveBeenCalled();
  });

  // =========================================================================
  // BUG #4 (RESOLVED): Handler return type simplified.
  // With the new type system, handler returns boolean | string only.
  // No MatchedRoute<T> return — eliminates the ignored-return-value bug.
  // =========================================================================
  describe('Bug #4 (resolved): Handler return values', () => {
    it('handler returning true proceeds with original match', async () => {
      const handler = vi.fn().mockReturnValue(true);

      const router = new Router([
        { path: '/page', view: 'PageView', handler }
      ]);

      const url = new URL('http://localhost/page');
      const result = await navigate(router, url, true);

      expect(result).not.toBeNull();
      expect(mockDispatchEvent).toHaveBeenCalled();
      const event = mockDispatchEvent.mock.calls[0][0];
      expect(event.detail.view).toBe('PageView');
    });

    it('handler returning false cancels navigation', async () => {
      const handler = vi.fn().mockReturnValue(false);

      const router = new Router([
        { path: '/blocked', view: 'BlockedView', handler }
      ]);

      const url = new URL('http://localhost/blocked');
      const result = await navigate(router, url, true);

      expect(result).toBeNull();
      expect(mockDispatchEvent).not.toHaveBeenCalled();
    });

    it('handler returning string redirects', async () => {
      const handler = vi.fn().mockReturnValue('/target');

      const router = new Router([
        { path: '/source', handler },
        { path: '/target', view: 'TargetView' }
      ]);

      const url = new URL('http://localhost/source');
      const result = await navigate(router, url, true);

      expect(result?.view).toBe('TargetView');
    });

    it('async handler returning true proceeds', async () => {
      const handler = vi.fn().mockResolvedValue(true);

      const router = new Router([
        { path: '/async', view: 'AsyncView', handler }
      ]);

      const url = new URL('http://localhost/async');
      const result = await navigate(router, url, true);

      expect(result?.view).toBe('AsyncView');
      expect(mockDispatchEvent).toHaveBeenCalled();
    });
  });

  // =========================================================================
  // BUG #8: popstate handler — async errors are unhandled
  // =========================================================================
  describe('Bug #8: Error handling in navigation', () => {
    it('handler that throws should not leave router in broken state', async () => {
      const handler = vi.fn().mockRejectedValue(new Error('Auth service down'));

      const router = new Router([
        { path: '/protected', handler },
        { path: '/home', view: 'HomeView' }
      ]);

      // Navigation to /protected throws
      await expect(navigate(router, new URL('http://localhost/protected'), true))
        .rejects.toThrow('Auth service down');

      // Router should still work for other routes
      const result = await navigate(router, new URL('http://localhost/home'), true);
      expect(result).not.toBeNull();
      expect(result?.view).toBe('HomeView');
    });

    it('synchronous handler that throws is properly propagated', async () => {
      const handler = vi.fn().mockImplementation(() => {
        throw new Error('Sync error');
      });

      const router = new Router([
        { path: '/broken', handler }
      ]);

      await expect(navigate(router, new URL('http://localhost/broken'), true))
        .rejects.toThrow('Sync error');
    });
  });

  // =========================================================================
  // Redirect chains and edge cases
  // =========================================================================
  describe('Redirect edge cases', () => {
    it('handles chained redirects (A → B → C)', async () => {
      const router = new Router([
        { path: '/a', redirect: '/b' },
        { path: '/b', redirect: '/c' },
        { path: '/c', view: 'FinalView' }
      ]);

      const result = await navigate(router, new URL('http://localhost/a'), true);
      expect(result?.view).toBe('FinalView');
    });

    it('redirect to unknown path returns null', async () => {
      const router = new Router([
        { path: '/old', redirect: '/nonexistent' }
      ]);

      const result = await navigate(router, new URL('http://localhost/old'), true);
      expect(result).toBeNull();
    });

    // NOTE: Circular redirects will cause infinite recursion / stack overflow.
    // This test documents that there is no guard against it.
    it('circular redirects cause stack overflow (no guard)', async () => {
      const router = new Router([
        { path: '/a', redirect: '/b' },
        { path: '/b', redirect: '/a' }
      ]);

      // This WILL throw a stack overflow — documenting the missing guard
      await expect(navigate(router, new URL('http://localhost/a'), true))
        .rejects.toThrow();
    });
  });

  // =========================================================================
  // Event detail completeness
  // =========================================================================
  describe('Dispatched event detail', () => {
    it('event detail contains path, params, search, and hash', async () => {
      const router = new Router([
        { path: '/items/{id}', view: 'ItemView' }
      ]);

      const url = new URL('http://localhost/items/99?sort=name#top');
      await navigate(router, url, true);

      const event = mockDispatchEvent.mock.calls[0][0];
      expect(event.type).toBe('texivia');
      expect(event.detail.params).toEqual({ id: '99' });
      expect(event.detail.search).toEqual({ sort: 'name' });
      expect(event.detail.hash).toBe('#top');
      expect(event.detail.view).toBe('ItemView');
    });

    it('event bubbles', async () => {
      const router = new Router([
        { path: '/page', view: 'PageView' }
      ]);

      await navigate(router, new URL('http://localhost/page'), true);

      const event = mockDispatchEvent.mock.calls[0][0];
      expect(event.bubbles).toBe(true);
    });
  });
});
