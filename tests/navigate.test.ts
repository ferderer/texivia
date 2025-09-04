import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { Router } from '../src/router';

// Define a test route configuration interface
interface TestRouteConfig {
  path: string;
  redirect?: string;
  hooks?: Array<(route: any, params: Record<string, string>) => boolean | string>;
}

describe('Router.navigate()', () => {
  let router: Router<TestRouteConfig>;
  let mockDispatchEvent: vi.Mock;

  beforeEach(() => {
    // Mock window history
    window.history.pushState = vi.fn();

    // Mock document.dispatchEvent
    mockDispatchEvent = vi.fn();
    document.dispatchEvent = mockDispatchEvent;

    // Setup routes
    router = new Router<TestRouteConfig>({
      home: { path: '/' },
      about: { path: '/about' },
      redirected: { path: '/redirected' },
      redirectRoute: { path: '/redirect', redirect: '/redirected' },
      userProfile: { path: '/users/{userId}' },
      posts: { path: '/users/{userId}/posts' },
      post: { path: '/users/{userId}/posts/{postId:[0-9]+}' },
      NotFound: { path: '*' },
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  test('navigates to a valid route and adds to history', async () => {
    const result = await router.navigate('/about');

    expect(result).toEqual({
      route: expect.objectContaining({ name: 'about', path: '/about' }),
      params: {}
    });
    expect(window.history.pushState).toHaveBeenCalledWith({ path: '/about' }, '', '/about');
    expect(mockDispatchEvent).toHaveBeenCalled();
  });

  test('navigates to a route with params', async () => {
    const result = await router.navigate('/users/123');

    expect(result).toEqual({
      route: expect.objectContaining({ name: 'userProfile', path: '/users/{userId}' }),
      params: { userId: '123' }
    });
    expect(window.history.pushState).toHaveBeenCalledWith({ path: '/users/123' }, '', '/users/123');
  });

  test('navigates to a route with regex params', async () => {
    const result = await router.navigate('/users/123/posts/456');

    expect(result).toEqual({
      route: expect.objectContaining({ name: 'post', path: '/users/{userId}/posts/{postId:[0-9]+}' }),
      params: { userId: '123', postId: '456' }
    });
  });

  test('navigates to 404 when route not found', async () => {
    const result = await router.navigate('/nonexistent');

    if (result !== false) {
      expect(result.route.name).toBe('NotFound');
      expect(result.params).toEqual({});
    }
  });

  test('does not add to history when pushState is false', () => {
    router.navigate('/about', false);

    expect(window.history.pushState).not.toHaveBeenCalled();
    expect(mockDispatchEvent).toHaveBeenCalled();
  });

  test('follows redirects', async () => {
    // Mock navigate to spy on subsequent calls
    const navigateSpy = vi.spyOn(router, 'navigate');

    await router.navigate('/redirect');

    expect(navigateSpy).toHaveBeenCalledWith('/redirected', true, 1);
  });

  test('executes route hooks', async () => {
    const hookSpy = vi.fn();
    router.routes.about.hooks = [hookSpy];

    await router.navigate('/about');

    expect(hookSpy)
      .toHaveBeenCalledWith(expect.objectContaining({ name: 'about' }), {}, null);
  });

  test('executes global hooks', async () => {
    const globalHookSpy = vi.fn();
    router.hooks = [globalHookSpy];

    await router.navigate('/about');

    expect(globalHookSpy)
      .toHaveBeenCalledWith(expect.objectContaining({ name: 'about' }), {}, null);
  });

  test('aborts navigation when hook returns false', async () => {
    const hookSpy = vi.fn().mockReturnValue(false);
    router.routes.about.hooks = [hookSpy];

    const result = await router.navigate('/about');

    expect(result).toBe(false);
    expect(window.history.pushState).not.toHaveBeenCalled();
    expect(mockDispatchEvent).not.toHaveBeenCalled();
  });

  test('redirects when hook returns string path', async () => {
    const hookSpy = vi.fn().mockReturnValue('/users/999');
    router.routes.about.hooks = [hookSpy];

    // Mock navigate to spy on subsequent calls
    const navigateSpy = vi.spyOn(router, 'navigate');

    await router.navigate('/about');

    expect(navigateSpy).toHaveBeenCalledWith('/users/999', true);
  });
});
