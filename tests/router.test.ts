import { describe, it, expect } from 'vitest';
import { Router } from '../src/router';

// Define the route configuration interface
interface TestRouteConfig {
  path: string;
  hooks?: Array<(route: any, params: Record<string, string>) => boolean | string>;
  redirect?: string;
}

describe('Router Constructor', () => {
  it('should fail creating a router with empty config', () => {
    expect(() => new Router<TestRouteConfig>({}, { ignoreUnknown: true }))
      .toThrow('Texivia error: no routes were specified');
  });

  it('should compile simple routes', () => {
    const router = new Router<TestRouteConfig>({
      Home: { path: "/" },
      About: { path: "/about" },
    });

    // Check that routes were stored
    expect(router.routes.Home).toBeDefined();
    expect(router.routes.About).toBeDefined();
    expect(router.routes.Home.path).toBe("/");
    expect(router.routes.About.path).toBe("/about");

    // Check that regex was created
    expect(router.mappings).toBeInstanceOf(RegExp);
  });

  it('should compile routes with array config', () => {
    const testHook = () => true;

    const router = new Router<TestRouteConfig>({
      Home: { path: "/" },
      User: { path: "/users/{id:\\d+}", hooks: [testHook] },
      Login: { path: "/login" },
      Redirect: { path: "/old", redirect: "/new" },
    });

    // Check routes are stored with their config
    expect(router.routes.Home.path).toBe("/");
    expect(router.routes.User.path).toBe("/users/{id:\\d+}");
    expect(router.routes.User.hooks).toEqual([testHook]);
    expect(router.routes.Redirect.redirect).toBe("/new");

    // Check that param names are extracted
    expect(router.routes.User.pattern.toString()).toBe('/^\\/users\\/(?<id>\\d+)$/');
    expect(router.routes.User.params).toEqual(['id']);
  });

  it('should process path', () => {
    const router = new Router<TestRouteConfig>({
      AdminContent: { path: '/{locale}/admin/content/{id}' },
    });
    const route = router.routes.AdminContent;
    expect(route.pattern.toString()).toBe('/^\\/(?<locale>[^/]+)\\/admin\\/content\\/(?<id>[^/]+)$/');
    expect(route.params).toEqual(['locale', 'id']);
  });
});
