import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Router } from '../src/router';

// Define a minimal route config interface for testing
interface TestRouteConfig {
  path: string;
  name?: string; // Optional, added during compilation
}

describe('_dispatchEvent', () => {
  let router: Router<TestRouteConfig>;

  beforeEach(() => {
    // Mock window.location
    delete (window as any).location;
    window.location = {
      pathname: '/test/path',
      search: '?foo=bar&baz=qux',
    } as Location;

    // Mock document.dispatchEvent
    document.dispatchEvent = vi.fn();

    // Initialize the Router instance
    router = new Router<TestRouteConfig>({
      Home: { path: '/' },
    });
  });

  it('dispatches a navigation event with correct details', () => {
    // Sample navigation result
    const route: TestRouteConfig = { name: 'testRoute', path: '/' };
    const params: Record<string, string> = { id: '123' };

    // Spy on document.dispatchEvent
    const dispatchSpy = vi.spyOn(document, 'dispatchEvent');

    // Call _dispatchEvent
    router._dispatchEvent(route, params);

    // Verify dispatchEvent was called once
    expect(dispatchSpy).toHaveBeenCalledTimes(1);

    // Extract the dispatched event
    const event = dispatchSpy.mock.calls[0][0] as CustomEvent;

    // Check event properties
    expect(event.type).toBe('texivia');
    expect(event.bubbles).toBe(true);
    expect(event.detail).toEqual({
      route: { name: 'testRoute', path: '/' },
      path: '/test/path',
      params: { id: '123' },
      query: { foo: 'bar', baz: 'qux' },
    });
  });

  it('handles missing params by using an empty object', () => {
    const route: TestRouteConfig = { name: 'testRoute', path: '/' };

    const dispatchSpy = vi.spyOn(document, 'dispatchEvent');
    router._dispatchEvent(route);

    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    const event = dispatchSpy.mock.calls[0][0] as CustomEvent;
    expect(event.detail.params).toEqual({});
  });

  it('handles an empty query string', () => {
    window.location.search = '';

    const route: TestRouteConfig = { name: 'testRoute', path: '/' };

    const dispatchSpy = vi.spyOn(document, 'dispatchEvent');
    router._dispatchEvent(route);

    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    const event = dispatchSpy.mock.calls[0][0] as CustomEvent;
    expect(event.detail.query).toEqual({});
  });

  it('handles a query string with only "?"', () => {
    window.location.search = '?';

    const route: TestRouteConfig = { name: 'testRoute', path: '/' };

    const dispatchSpy = vi.spyOn(document, 'dispatchEvent');
    router._dispatchEvent(route, {});

    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    const event = dispatchSpy.mock.calls[0][0] as CustomEvent;
    expect(event.detail.query).toEqual({});
  });
});
