import { describe, it, expect, beforeEach } from 'vitest';
import { Router } from '../src/router';

// Define a minimal route config interface for testing
interface TestRouteConfig {
  path: string;
  name?: string; // Optional, added during compilation
}

describe('generateUrl', () => {
  let router: Router<TestRouteConfig>;

  beforeEach(() => {
    router = new Router<TestRouteConfig>({
      Home: { path: '/' },
      User: { path: '/users/{id}' },
      Post: { path: '/posts/{slug}' },
      UserPosts: { path: '/users/{userId}/posts/{postId}' },
    });
  });

  // Test 1: Basic functionality with parameters
  it('generates URL for a route with parameters', () => {
    const url = router.generateUrl('User', { id: '123' });
    expect(url).toBe('/users/123');
  });

  // Test 2: Route without parameters
  it('generates URL for a route without parameters', () => {
    const url = router.generateUrl('Home');
    expect(url).toBe('/');
  });

  // Test 3: Error for missing route
  it('throws error for missing route', () => {
    expect(() => router.generateUrl('Missing')).toThrow("Named route 'Missing' not found");
  });

  // Test 4: Error for missing parameter
  it('throws error for missing parameter', () => {
    expect(() => router.generateUrl('User', {})).toThrow("Missing required parameter: id for route 'User'");
  });

  // Test 5: Special characters encoding
  it('encodes special characters in parameters', () => {
    const url = router.generateUrl('Post', { slug: 'hello world' });
    expect(url).toBe('/posts/hello%20world');
  });

  // Test 6: Query parameters
  it('appends query parameters', () => {
    const url = router.generateUrl('Home', {}, { search: 'test' });
    expect(url).toBe('/?search=test');
  });

  // Test 9: Empty string as parameter
  it('allows empty string as parameter value', () => {
    const url = router.generateUrl('User', { id: '' });
    expect(url).toBe('/users/');
  });

  // Test 10: Extra parameters ignored
  it('ignores extra parameters for routes without parameters', () => {
    const url = router.generateUrl('Home', { extra: 'param' });
    expect(url).toBe('/');
  });

  // Test 11: Missing one of multiple parameters
  it('throws error for missing one of multiple parameters', () => {
    expect(() => router.generateUrl('UserPosts', { userId: '123' })).toThrow(
      "Missing required parameter: postId for route 'UserPosts'"
    );
  });

  // Test 12: Special characters in query parameters
  it('encodes special characters in query parameters', () => {
    const url = router.generateUrl('Home', {}, { search: 'hello&world' });
    expect(url).toBe('/?search=hello%26world');
  });
});
