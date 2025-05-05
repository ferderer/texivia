import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Router } from '../src/texivia-micro';

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

  it('processes route handlers', async () => {
    const customView = { name: 'CustomView' };
    const handler = vi.fn().mockResolvedValue(customView);

    const router = new Router([
      { path: '/handler', handler }
    ]);

    const url = new URL('http://localhost/handler');
    const result = await navigate(router, url, true);

    expect(handler).toHaveBeenCalled();
    expect(result?.view).toBe(customView);
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
});
