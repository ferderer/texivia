/**
 * A hook function type that runs before navigation.
 *
 * @template T - The type of view associated with the route.
 * @param match - The matched route object.
 * @returns A boolean, string, or a Promise resolving to one of these types.
 *   - If `false`, navigation is cancelled.
 *   - If a `string`, navigation is redirected to the given path.
 *   - If `true`, navigation proceeds as normal.
 */
type HookType<T> = (match: MatchedRoute<T>) => boolean | string | Promise<boolean | string>

/**
 * Configuration for a route in the router.
 * @template T The type of view associated with routes.
 */
type ConfigRoute<T> = {
  path: string;
  view?: T;
  redirect?: string;
  handler?: HookType<T>;
}

/**
 * Internal representation of a compiled route with regex for parameter matching.
 * @template T The type of view associated with routes.
 */
type CompiledRoute<T> = ConfigRoute<T> & {
  paramRegex: RegExp | null;
}

/**
 * Representation of a matched route with extracted parameters.
 * @template T The type of view associated with routes.
 */
type MatchedRoute<T> = {
  readonly path: string;
  view?: T;
  readonly params: Record<string, string>;
  readonly search: Record<string, string>;
  readonly hash: string;
}

/**
 * Maximum number of redirects before aborting navigation.
 */
const MAX_REDIRECTS = 10;

/**
 * Lightweight, framework-agnostic router for single-page applications.
 * Compiles all routes into a single regex for O(1) matching.
 *
 * @template T The type of view to be used with the router.
 */
class Router<T = unknown> {
  private segmentRegex = /(?:\/([^\/{}]+)|\/\{([a-zA-Z_$][a-zA-Z0-9_$]*)(?::([^/]+))?\}|(\/))/g;
  private static readonly EVENT_NAME = 'texivia';
  private readonly _mapping: RegExp | null;
  private readonly _routes: Array<CompiledRoute<T>> = [];
  private _boundPopState: ((event: PopStateEvent) => void) | null = null;
  private _boundClick: ((event: MouseEvent) => void) | null = null;
  private _currentUrl = window.location.href;

  /**
   * Creates a new router instance with the provided route configuration.
   * @param config Array of route configurations.
   * @throws {Error} If a route path is malformed.
   */
  constructor(config: Array<ConfigRoute<T>> = []) {
    const mappings: string[] = [];

    let wildcard;
    for (const c of config) {
      if (c.path === '*') {
        wildcard = c;
      }
      else {
        const matches = c.path.match(this.segmentRegex);
        if (!matches || matches.join('') !== c.path)
          throw new Error(`Malformed path: ${c.path}`);

        let paramRegexString = '^';
        let mappingRegex = '(^';
        const paramNames: string[] = [];

        c.path.replace(this.segmentRegex, (_: string, literal: string, param: string, rx: string, slash: string) => {
          if (literal) {
            const escaped = '\\/' + literal.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
            paramRegexString += escaped;
            mappingRegex += escaped;
          }
          else if (param) {
            paramRegexString += `\\/(?<${param}>${rx || '[^\\/]+'})`;
            mappingRegex += `\\/(?:${rx || '[^\\/]+'})`;
            paramNames.push(param);
          }
          else if (slash) {
            paramRegexString += '\\/';
            mappingRegex += '\\/';
          }
          return '';
        });

        paramRegexString += '$';
        mappingRegex += '$)';
        mappings.push(mappingRegex);
        const paramRegex = paramNames.length ? new RegExp(paramRegexString) : null;
        this._routes.push({ ...c, paramRegex });
      }
    }
    if (wildcard) {
      this._routes.push({ ...wildcard, paramRegex: null });
      mappings.push('(.*)');
    }

    this._mapping = mappings.length ? new RegExp(mappings.join('|'), 'i') : null;
  }

  /**
   * Starts the router by attaching event listeners and handling the current URL.
   */
  async start(): Promise<void> {
    this._boundPopState = this._handlePopState.bind(this);
    window.addEventListener('popstate', this._boundPopState);

    this._boundClick = this._onclick.bind(this);
    document.addEventListener('click', this._boundClick);

    const url = new URL(window.location.href);
    window.history.replaceState({ path: url.pathname }, '', url);
    await this._navigate(url, false);
  }

  /**
   * Stops the router by removing all event listeners.
   */
  stop(): void {
    if (this._boundPopState) window.removeEventListener('popstate', this._boundPopState);
    if (this._boundClick) document.removeEventListener('click', this._boundClick);
    this._boundPopState = null;
    this._boundClick = null;
  }

  /**
   * Navigates programmatically to the given path.
   * @param path - The path to navigate to (e.g. '/recipe/42' or '/search?q=pasta#results').
   * @returns The matched route, or null if no route matches or navigation was cancelled.
   */
  async navigate(path: string): Promise<MatchedRoute<T> | null> {
    return this._navigate(new URL(path, window.location.origin), true);
  }

  /**
   * Click event handler that intercepts link clicks for routing.
   * @param event - The click event object.
   */
  private async _onclick(event: MouseEvent): Promise<void> {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;

    const anchor = (event.target as HTMLElement).closest('a');
    if (!anchor || !anchor.href) return;

    let url: URL;
    try {
      url = new URL(anchor.href);
    } catch {
      return;
    }

    if (url.origin !== window.location.origin) return;
    if (anchor.target && anchor.target !== '_self') return;
    if (anchor.hasAttribute('download')
      || anchor.getAttribute('rel') === 'external'
      || anchor.hasAttribute('no-router')) return;
    if (anchor.getAttribute('href')?.startsWith('#')) return;

    event.preventDefault();
    await this._navigate(url, true);
  }

  /**
   * Navigates to the specified URL.
   * @param url - The URL to navigate to.
   * @param pushState - Whether to add the URL to browser history.
   * @param redirectCount - Current redirect depth (prevents infinite loops).
   * @returns The matched route or null if no match found.
   * @throws {Error} If redirect limit is exceeded.
   */
  private async _navigate(url: URL, pushState: boolean, redirectCount = 0): Promise<MatchedRoute<T> | null> {
    if (redirectCount > MAX_REDIRECTS)
      throw new Error('Texivia: redirect limit exceeded');

    const result = this._match(url.pathname, Object.fromEntries(new URLSearchParams(url.search)), url.hash);
    if (result === null) return null;

    if (result.redirect)
      return this._navigate(new URL(result.redirect, window.location.origin), pushState, redirectCount + 1);

    if (result.handler) {
      const hookResult = await Promise.resolve(result.handler(result.event));
      if (hookResult === false) {
        if (!pushState) {
            window.history.pushState({ path: this._currentUrl }, '', this._currentUrl);
        }
        return null;
      }
      this._currentUrl = url.href;
      if (typeof hookResult === 'string')
        return this._navigate(new URL(hookResult, window.location.origin), pushState, redirectCount + 1);
    }

    if (pushState)
      window.history.pushState({ path: url.pathname }, '', url);

    document.dispatchEvent(new CustomEvent(Router.EVENT_NAME, { detail: result.event, bubbles: true }));
    return result.event;
  }

  /**
   * Matches a path against the defined routes.
   * @param path - The path to match.
   * @param search - The query parameters.
   * @param hash - The URL hash fragment.
   * @returns Internal match result separating public event data from internal routing data, or null.
   */
  private _match(path: string, search: Record<string, string>, hash: string):
    { event: MatchedRoute<T>; redirect?: string; handler?: HookType<T> } | null {

    if (!this._mapping)
      return null;

    const matches = this._mapping.exec(path);
    if (!matches || matches[0] !== path)
      return null;

    const index = matches.findIndex((item, i) => i > 0 && item !== undefined);
    if (index === -1)
      return null;

    const route = this._routes[index - 1];
    let params: Record<string, string> = {};

    if (route.paramRegex) {
      const paramsMatch = route.paramRegex.exec(path);
      if (!paramsMatch)
        throw new Error(`Texivia: param regex mismatch on path '${path}' for route '${route.path}'`);
      params = paramsMatch.groups || {};
    }

    return {
      event: { path, view: route.view, params, search, hash },
      redirect: route.redirect,
      handler: route.handler,
    };
  }

  /**
   * Handles the popstate event when the user navigates browser history.
   */
  private async _handlePopState(_: PopStateEvent): Promise<void> {
    await this._navigate(new URL(window.location.href), false);
  }
}

export { Router, type ConfigRoute, type MatchedRoute, type HookType };
