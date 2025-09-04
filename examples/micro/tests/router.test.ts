import { describe, test, expect, vi, beforeAll, beforeEach } from 'vitest';
import { Router } from '../src/lib/texivia-micro';

describe('Router', () => {
  let router: Router<string>;

  // Sample route configuration matching App.svelte usage
  const routes = [
    { path: '/', handler: () => `/${navigator.language}/` },
    { path: '/{locale}/', view: 'Landing' },
    { path: '/{locale}/login', view: 'Login' },
    { path: '/{locale}/users/{id:\\d+}/profile', view: 'UserProfile' },
    { path: '*', view: 'NotFound' },
  ];

  beforeAll(() => {
    Object.defineProperty(global.navigator, 'language', { value: 'en', writable: true });
  });

  beforeEach(() => {
    vi.clearAllMocks();

    // Spy on window.addEventListener and document.addEventListener
    vi.spyOn(window, 'addEventListener');
    vi.spyOn(window, 'removeEventListener');
    vi.spyOn(document, 'addEventListener');
    vi.spyOn(document, 'removeEventListener');
    vi.spyOn(document, 'dispatchEvent');

    Object.defineProperty(global, 'location', {
      value: {
        href: 'http://localhost/',
        origin: 'http://localhost',
        pathname: '/',
        search: '',
        hash: '',
      },
      writable: true,
    });

    router = new Router(routes);
  });

  // Constructor Tests
  describe('constructor', () => {
    test('initializes with valid routes', () => {
      expect(router).toBeInstanceOf(Router);
    });

    test('throws error for malformed path', () => {
      expect(() => new Router([{ path: '/invalid{path' }])).toThrow('Malformed path');
    });

    test('handles empty configuration', () => {
      const emptyRouter = new Router([]);
      expect(emptyRouter).toBeInstanceOf(Router);
    });
  });

  // start Method Tests
  describe('start', () => {
    test('attaches popstate and click event listeners', async () => {
      await router.start();
      expect(window.addEventListener).toHaveBeenCalledWith('popstate', expect.any(Function));
      expect(document.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    });

    test('navigates to current URL without pushing state', async () => {
      window.location.href = 'http://localhost/en/';
      await router.start();
      expect(document.dispatchEvent).toHaveBeenCalledWith(expect.objectContaining({
        detail: expect.objectContaining({ view: 'Landing' }),
      }));
      expect(window.history.pushState).not.toHaveBeenCalled();
    });
  });

  // stop Method Tests
  describe('stop', () => {
    test('removes popstate and click event listeners', async () => {
      await router.start();
      router.stop();
      expect(window.removeEventListener).toHaveBeenCalledWith('popstate', expect.any(Function));
      expect(document.removeEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    });
  });

  // _match Method Tests
  describe('_match', () => {
    test('matches root path and triggers handler', () => {
      const match = router['_match']('/', {}, '');
      expect(match).toMatchObject({
        path: '/',
        handler: expect.any(Function),
        params: {},
      });
    });

    test('matches parameterized route', () => {
      const match = router['_match']('/en/users/123/profile', {}, '');
      expect(match).toMatchObject({
        view: 'UserProfile',
        params: { locale: 'en', id: '123' },
      });
    });

    test('matches wildcard route', () => {
      const match = router['_match']('/nonexistent', {}, '');
      expect(match).toMatchObject({
        view: 'NotFound',
        params: {},
      });
    });

    test('returns null for unmatched path with empty config', () => {
      const emptyRouter = new Router([]);
      const match = emptyRouter['_match']('/path', {}, '');
      expect(match).toBeNull();
    });
  });

  // _navigate Method Tests
  describe('_navigate', () => {
    test('navigates to view and dispatches event', async () => {
      const url = new URL('http://localhost/en/login');
      const match = await router['_navigate'](url, false);
      expect(match).toMatchObject({ view: 'Login', params: { locale: 'en' } });
      expect(document.dispatchEvent).toHaveBeenCalledWith(expect.objectContaining({
        detail: expect.objectContaining({ view: 'Login' }),
      }));
    });

    test('handles redirect from handler', async () => {
      const url = new URL('http://localhost/');
      const match = await router['_navigate'](url, false);
      expect(match).toMatchObject({ view: 'Landing', params: { locale: 'en' } });
    });

    test('pushes state when requested', async () => {
      const url = new URL('http://localhost/en/login');
      await router['_navigate'](url, true);
      expect(window.history.pushState).toHaveBeenCalledWith(
        { path: '/en/login' },
        '',
        url
      );
    });

    test('returns null for no match with empty config', async () => {
      const emptyRouter = new Router([]);
      const url = new URL('http://localhost/test');
      const match = await emptyRouter['_navigate'](url, false);
      expect(match).toBeNull();
    });
  });

  // _onclick Method Tests (Indirect)
  describe('_onclick', () => {
    test('intercepts anchor click and navigates', async () => {
      await router.start();
      const anchor = document.createElement('a');
      anchor.href = 'http://localhost/en/login';
      document.body.appendChild(anchor);
      const event = new MouseEvent('click', { bubbles: true });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
      anchor.dispatchEvent(event);

      expect(document.dispatchEvent).toHaveBeenCalledWith(expect.objectContaining({
        detail: expect.objectContaining({ view: 'Login' }),
      }));
    });

    test('ignores external links', async () => {
      await router.start();
      const anchor = document.createElement('a');
      anchor.href = 'http://external.com';
      document.body.appendChild(anchor);
      const event = new MouseEvent('click', { bubbles: true });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
      anchor.dispatchEvent(event);

      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });

    test('ignores anchors with no-router attribute', async () => {
      await router.start();
      const anchor = document.createElement('a');
      anchor.href = 'http://localhost/en/login';
      anchor.setAttribute('no-router', '');
      document.body.appendChild(anchor);
      const event = new MouseEvent('click', { bubbles: true });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
      anchor.dispatchEvent(event);

      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });
  });

  // _handlePopState Method Tests (Indirect)
  describe('_handlePopState', () => {
    test('navigates on popstate without pushing state', async () => {
      await router.start();
      const popstateHandler = (window.addEventListener as vi.Mock).mock.calls
        .find(call => call[0] === 'popstate')[1];
      window.location.href = 'http://localhost/en/users/123/profile';
      await popstateHandler({} as PopStateEvent);
      expect(document.dispatchEvent).toHaveBeenCalledWith(expect.objectContaining({
        detail: expect.objectContaining({ view: 'UserProfile' }),
      }));
      expect(window.history.pushState).not.toHaveBeenCalled();
    });
  });
});
