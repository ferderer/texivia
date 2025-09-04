import { describe, it, expect } from 'vitest';
import { Router } from '../src/router';

describe('_process correct handling', () => {
  const dummy = new Router<{ path: string }>({ Home: { path: '/' }});

  it('0. handles the root path', () => {
    const route = dummy._process({ path: '/' });
    expect(route.pattern).toBeInstanceOf(RegExp);
    expect(route.pattern.toString()).toBe('/^\\/$/');
    expect(route.params).toEqual([]);
  });

  it('1. handles a single parameter at the beginning', () => {
    const route = dummy._process({ path: '/{userId}/profile' });
    expect(route.pattern.toString()).toBe('/^\\/(?<userId>[^/]+)\\/profile$/');
    expect(route.params).toEqual(['userId']);
  });

  it('2. handles a single parameter at the end', () => {
    const route = dummy._process({ path: '/profile/{userId}' });
    expect(route.pattern.toString()).toBe('/^\\/profile\\/(?<userId>[^/]+)$/');
    expect(route.params).toEqual(['userId']);
  });

  it('3. handles parameters at both the beginning and end', () => {
    const route = dummy._process({ path: '/{lang}/docs/{docId}' });
    expect(route.pattern.toString()).toBe('/^\\/(?<lang>[^/]+)\\/docs\\/(?<docId>[^/]+)$/');
    expect(route.params).toEqual(['lang', 'docId']);
  });

  it('4. handles a parameter at the beginning with a custom regex', () => {
    const route = dummy._process({ path: '/{id:\\d+}/users' });
    expect(route.pattern.toString()).toBe('/^\\/(?<id>\\d+)\\/users$/');
    expect(route.params).toEqual(['id']);
  });

  it('5. handles a parameter at the end with a custom regex', () => {
    const route = dummy._process({ path: '/users/{name:[a-z]+}' });
    expect(route.pattern.toString()).toBe('/^\\/users\\/(?<name>[a-z]+)$/');
    expect(route.params).toEqual(['name']);
  });

  it('6. handles multiple parameters with some at the beginning and end', () => {
    const route = dummy._process({ path: '/{version}/api/users/{id}/details/{type}' });
    expect(route.pattern.toString()).toBe('/^\\/(?<version>[^/]+)\\/api\\/users\\/(?<id>[^/]+)\\/details\\/(?<type>[^/]+)$/');
    expect(route.params).toEqual(['version', 'id', 'type']);
  });

  it('7. handles a parameter at the beginning with multiple literal segments', () => {
    const route = dummy._process({ path: '/{category}/v1/public/posts' });
    expect(route.pattern.toString()).toBe('/^\\/(?<category>[^/]+)\\/v1\\/public\\/posts$/');
    expect(route.params).toEqual(['category']);
  });

  it('8. handles a parameter at the end with multiple literal segments', () => {
    const route = dummy._process({ path: '/api/v1/users/{userId}' });
    expect(route.pattern.toString()).toBe('/^\\/api\\/v1\\/users\\/(?<userId>[^/]+)$/');
    expect(route.params).toEqual(['userId']);
  });

  it('9. handles parameters at beginning and end with custom regex patterns', () => {
    const route = dummy._process({ path: '/{year:\\d{4}}/events/{slug:[a-z-]+}' });
    expect(route.pattern.toString()).toBe('/^\\/(?<year>\\d{4})\\/events\\/(?<slug>[a-z-]+)$/');
    expect(route.params).toEqual(['year', 'slug']);
  });

  it('10. handles consecutive parameters starting at the beginning', () => {
    const route = dummy._process({ path: '/{group}/{subgroup}/settings' });
    expect(route.pattern.toString()).toBe('/^\\/(?<group>[^/]+)\\/(?<subgroup>[^/]+)\\/settings$/');
    expect(route.params).toEqual(['group', 'subgroup']);
  });

  it('11. handles consecutive parameters ending at the end', () => {
    const route = dummy._process({ path: '/data/{key}/{value}' });
    expect(route.pattern.toString()).toBe('/^\\/data\\/(?<key>[^/]+)\\/(?<value>[^/]+)$/');
    expect(route.params).toEqual(['key', 'value']);
  });

  it('12. handles a parameter at the beginning with special characters in literals', () => {
    const route = dummy._process({ path: '/{id}/users/[active]' });
    expect(route.pattern.toString()).toBe('/^\\/(?<id>[^/]+)\\/users\\/\\[active\\]$/');
    expect(route.params).toEqual(['id']);
  });

  it('13. handles a parameter at the end with special characters in literals', () => {
    const route = dummy._process({ path: '/users/[active]/{status}' });
    expect(route.pattern.toString()).toBe('/^\\/users\\/\\[active\\]\\/(?<status>[^/]+)$/');
    expect(route.params).toEqual(['status']);
  });

  it('14. handles a mix of parameters with one at the beginning', () => {
    const route = dummy._process({ path: '/{prefix}/users/{id}/posts/{title}' });
    expect(route.pattern.toString()).toBe('/^\\/(?<prefix>[^/]+)\\/users\\/(?<id>[^/]+)\\/posts\\/(?<title>[^/]+)$/');
    expect(route.params).toEqual(['prefix', 'id', 'title']);
  });

  it('15. handles a mix of parameters with one at the end', () => {
    const route = dummy._process({ path: '/users/{id}/posts/{title}/{suffix}' });
    expect(route.pattern.toString()).toBe('/^\\/users\\/(?<id>[^/]+)\\/posts\\/(?<title>[^/]+)\\/(?<suffix>[^/]+)$/');
    expect(route.params).toEqual(['id', 'title', 'suffix']);
  });

  it('16. handles the trailing slash', () => {
    const route = dummy._process({ path: '/user/{id:\\d+}/' });
    expect(route.pattern.toString()).toBe('/^\\/user\\/(?<id>\\d+)\\/$/');
    expect(route.params).toEqual(['id']);
  });

  it('17. handles double slash in the middle', () => {
    const route = dummy._process({ path: '/user//{id:\\d+}/' });
    expect(route.pattern.toString()).toBe('/^\\/user\\/\\/(?<id>\\d+)\\/$/');
    expect(route.params).toEqual(['id']);
  });

  it('throws an error for path not starting with a slash', () => {
    const malformedPath = 'user/{id:\\d+}/';
    expect(() => dummy._process({ path: malformedPath }))
      .toThrow(`Malformed path: ${malformedPath}`);
  });

  it('throws an error for unmatched braces', () => {
    const malformedPath = '/user/{id:\\d+/';
    expect(() => dummy._process({ path: malformedPath }))
      .toThrow(`Malformed path: ${malformedPath}`);
  });
});
