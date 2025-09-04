import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Router } from '../src/router'; // Adjust the import path as necessary

// Define a minimal route config interface for testing
interface TestRouteConfig {
  path: string;
  name?: string; // Optional, added during compilation
}

describe('navigateToNamed', () => {
  let router: Router<TestRouteConfig>;

  beforeEach(() => {
    // Mock console.error to suppress output and allow verification
    vi.spyOn(console, 'error').mockImplementation(() => {});

    // Initialize the Router instance with sample named routes
    router = new Router<TestRouteConfig>({
      Home: { path: '/' },
      User: { path: '/users/{id:\\d+}' },
      Post: { path: '/posts/{slug}' },
      Category: { path: '/categories/{category}/{subcategory}' },
    });

    // Mock the navigate function to track calls and return a predictable result
    router.navigate = vi.fn().mockImplementation((path: string, pushState: boolean) => ({ path, pushState }));
  });

  afterEach(() => {
    // Restore all mocks to their original state
    vi.restoreAllMocks();
  });

  it('navigates to a named route with parameters', async () => {
    const result = await router.navigateToNamed('User', { id: '123' }, true);
    expect(router.navigate).toHaveBeenCalledWith('/users/123', true);
    expect(result).toEqual({ path: '/users/123', pushState: true });
  });

  it('navigates to a named route without parameters', async () => {
    const result = await router.navigateToNamed('Home', {}, true);
    expect(router.navigate).toHaveBeenCalledWith('/', true);
    expect(result).toEqual({ path: '/', pushState: true });
  });

  it('throws an error for missing named route', async () => {
    let error;
    try {
      await router.navigateToNamed('MissingRoute', {}, true);
    }
    catch (e) {
      error = e;
    }
    expect(error).toBeDefined();
    expect(error.message).toBe("Named route 'MissingRoute' not found");
  });

  it('replaces multiple parameters in the path', async () => {
    const result = await router.navigateToNamed('Category', { category: 'tech', subcategory: 'ai' }, true);
    expect(router.navigate).toHaveBeenCalledWith('/categories/tech/ai', true);
    expect(result).toEqual({ path: '/categories/tech/ai', pushState: true });
  });

  it('replaces missing parameters with an empty string', async () => {
    const result = await router.navigateToNamed('User', {}, true);
    expect(router.navigate).toHaveBeenCalledWith('/users/', true);
    expect(result).toEqual({ path: '/users/', pushState: true });
  });

  it('handles routes with regex in parameters', async () => {
    const result = await router.navigateToNamed('User', { id: '456' }, true);
    expect(router.navigate).toHaveBeenCalledWith('/users/456', true);
    expect(result).toEqual({ path: '/users/456', pushState: true });
  });

  it('does not update history when pushState is false', async () => {
    const result = await router.navigateToNamed('Post', { slug: 'hello-world' }, false);
    expect(router.navigate).toHaveBeenCalledWith('/posts/hello-world', false);
    expect(result).toEqual({ path: '/posts/hello-world', pushState: false });
  });
});
