import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Router } from '../src/router';

// Define a minimal route config interface for testing
interface TestRouteConfig {
  path: string;
  name?: string; // Optional property for flexibility
}

describe('_handlePopState', () => {
  let router: Router<TestRouteConfig>;

  // Set up a fresh Router instance before each test
  beforeEach(() => {
    router = new Router<TestRouteConfig>({ Home: { path: '/' } });
    router.navigate = vi.fn(); // Mock the navigate method to track calls
  });

  /** Test 1: Basic Functionality */
  it('calls navigate with the correct path and pushState=false', () => {
    // Mock window.location
    delete (window as any).location;
    window.location = {
      pathname: '/test/path',
      search: '?query=param',
    } as Location;

    // Call _handlePopState directly with a mock event
    router._handlePopState({} as PopStateEvent);

    // Verify the navigate call
    expect(router.navigate).toHaveBeenCalledWith('/test/path?query=param', false);
  });

  /** Test 2: Handling Empty Search Parameter */
  it('handles URLs with no search parameters', () => {
    // Mock window.location with no search
    delete (window as any).location;
    window.location = {
      pathname: '/simple/path',
      search: '',
    } as Location;

    // Call _handlePopState
    router._handlePopState({} as PopStateEvent);

    // Verify the navigate call
    expect(router.navigate).toHaveBeenCalledWith('/simple/path', false);
  });

  /** Test 3: Responds to popstate Event */
  it('responds correctly to a popstate event', () => {
    // Mock window.location
    delete (window as any).location;
    window.location = {
      pathname: '/event/test',
      search: '?pop=true',
    } as Location;

    // Call _handlePopState
    router._handlePopState({} as PopStateEvent);

    // Simulate a popstate event
    const event = new PopStateEvent('popstate');
    window.dispatchEvent(event);

    // Verify the navigate call
    expect(router.navigate).toHaveBeenCalledWith('/event/test?pop=true', false);
  });
});
