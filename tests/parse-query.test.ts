import { describe, it, expect } from 'vitest';
import { Router } from '../src/router';

// Define a minimal route config interface for testing
interface TestRouteConfig {
  path: string;
}

describe('_parseQuery', () => {
  const router = new Router<TestRouteConfig>({
    Home: { path: '/' },
  });

  it('parses basic key-value pairs', () => {
    const queryString: string = 'foo=bar&baz=qux';
    const result: Record<string, string> = router._parseQuery(queryString);
    expect(result).toEqual({ foo: 'bar', baz: 'qux' });
  });

  it('handles leading ?', () => {
    const queryString: string = '?foo=bar';
    const result: Record<string, string> = router._parseQuery(queryString);
    expect(result).toEqual({ foo: 'bar' });
  });

  it('handles key with empty value', () => {
    const queryString: string = 'foo=';
    const result: Record<string, string> = router._parseQuery(queryString);
    expect(result).toEqual({ foo: '' });
  });

  it('handles key without =', () => {
    const queryString: string = 'foo';
    const result: Record<string, string> = router._parseQuery(queryString);
    expect(result).toEqual({ foo: '' });
  });

  it('handles empty query string', () => {
    const queryString: string = '';
    const result: Record<string, string> = router._parseQuery(queryString);
    expect(result).toEqual({});
  });

  it('handles query string with only ?', () => {
    const queryString: string = '?';
    const result: Record<string, string> = router._parseQuery(queryString);
    expect(result).toEqual({});
  });

  it('handles multiple & separators', () => {
    const queryString: string = '&&foo=bar';
    const result: Record<string, string> = router._parseQuery(queryString);
    expect(result).toEqual({ foo: 'bar' });
  });

  it('handles trailing &', () => {
    const queryString: string = 'foo=bar&';
    const result: Record<string, string> = router._parseQuery(queryString);
    expect(result).toEqual({ foo: 'bar' });
  });

  it('decodes URL-encoded characters', () => {
    const queryString: string = 'foo%20bar=baz%20qux';
    const result: Record<string, string> = router._parseQuery(queryString);
    expect(result).toEqual({ 'foo bar': 'baz qux' });
  });

  it('overwrites duplicate keys', () => {
    const queryString: string = 'foo=bar&foo=baz';
    const result: Record<string, string> = router._parseQuery(queryString);
    expect(result).toEqual({ foo: 'baz' });
  });

  it('handles special characters including + as space', () => {
    const queryString: string = 'foo+bar=baz%20qux';
    const result: Record<string, string> = router._parseQuery(queryString);
    expect(result).toEqual({ 'foo bar': 'baz qux' });
  });

  it('handles encoded = and & in values', () => {
    const queryString: string = 'foo=bar%3Dqux&baz=qux%26corge=grault';
    const result: Record<string, string> = router._parseQuery(queryString);
    expect(result).toEqual({ foo: 'bar=qux', baz: 'qux&corge=grault' });
  });

  it('handles multiple = in value', () => {
    const queryString: string = 'foo=bar=baz';
    const result: Record<string, string> = router._parseQuery(queryString);
    expect(result).toEqual({ foo: 'bar=baz' });
  });

  it('handles multiple keys without values', () => {
    const queryString: string = 'foo&bar&baz';
    const result: Record<string, string> = router._parseQuery(queryString);
    expect(result).toEqual({ foo: '', bar: '', baz: '' });
  });

  it('handles encoded + in values', () => {
    const queryString: string = 'foo=bar%2Bbaz';
    const result: Record<string, string> = router._parseQuery(queryString);
    expect(result).toEqual({ foo: 'bar+baz' });
  });
});
