/**
 * A hook function type that can be used as a route handler.
 *
 * @template T - The type of view or data associated with the route.
 * @param match - The matched route object, containing route details and parameters.
 * @returns A boolean, string, T, or a Promise resolving to one of these types.
 *   - If `false`, navigation is cancelled.
 *   - If a `string`, navigation is redirected to the given path.
 *   - If `T`, the view/data is used for the route.
 *   - If `true`, navigation proceeds as normal.
 */
type HookType<T> = (match: MatchedRoute<T>) => string | MatchedRoute<T> | Promise<string | MatchedRoute<T>>

/**
 * Configuration for a route in the router
 * @template T The type of view associated with routes
 */
type ConfigRoute<T> = T & { path: string, redirect?: string, handler?: HookType<T> }

/**
 * Internal representation of a compiled route with regex for parameter matching
 * @template T The type of view associated with routes
 */
type CompiledRoute<T> = ConfigRoute<T> & { paramRegex: RegExp | null, paramNames: string[] }

/**
 * Representation of a matched route with extracted parameters
 * @template T The type of view associated with routes
 */
type MatchedRoute<T> = CompiledRoute<T> & { params: Record<string, string>, search: Record<string, string>, hash: string }

/**
 * Lightweight router for single-page applications
 * @template T The type of view to be used with the router
 */
class Router<T = any> {
  private static readonly SEGMENT_REGEX = /(?:\/([^\/{}]+)|\/\{([a-zA-Z_$][a-zA-Z0-9_$]*)(?::([^/]+))?\}|(\/))/g;
  private static readonly EVENT_NAME = 'texivia';
  private _mapping: RegExp | null;
  private _routes: Array<CompiledRoute<T>> = [];
  private _boundPopState!: (event: PopStateEvent) => void
  private _boundClick!: (event: MouseEvent) => void;
  private _boundGoto!: (event: CustomEvent) => void;

  /**
   * Creates a new router instance with the provided route configuration
   * @param config Array of route configurations
   */
  constructor(config: Array<ConfigRoute<T>> = []) {
    let mappings: string[] = [];
    for(const c of config) {
      if (c.path === '*') {
        mappings.push('(^.*$)');
        this._routes.push({ ...c, paramRegex: null, paramNames: [] });
      }
      else {
        const matches = c.path.match(Router.SEGMENT_REGEX);
        if (!matches || matches.join('') !== c.path)
          throw new Error(`Malformed path: ${c.path}`);

        let paramRegexString = '^';
        let mappingRegex = '(^';
        const paramNames: string[] = [];
        c.path.replace(Router.SEGMENT_REGEX, (match: any, literal: string, param: string, rx: string, slash: string) => {
          if (literal) {
            const escaped = '\\/' + literal.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
            paramRegexString += escaped;
            mappingRegex += escaped;
          }
          else if (param) {
            paramRegexString += `\\/(?<${param}>${rx || '[^\\/]+'})`;
            mappingRegex += `\\/${rx || '[^\\/]+'}`;
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
        let paramRegex = paramNames.length ? new RegExp(paramRegexString) : null;
        this._routes.push({ ...c, paramRegex, paramNames });
      }
    }
    this._mapping = mappings.length ? new RegExp(mappings.join('|'), 'i') : null;
  }

  /**
   * Starts the router by attaching event listeners and handling the current URL
   * @returns {void}
   */
  async start(): Promise<void> {
    this._boundPopState = this._handlePopState.bind(this);
    window.addEventListener('popstate', this._boundPopState);

    this._boundClick = this._onclick.bind(this);
    document.addEventListener('click', this._boundClick);

    this._boundGoto = this._goto.bind(this);
    document.addEventListener('texivia.goto', this._boundGoto as EventListener);

    await this._navigate(new URL(window.location.href), false);
  }

  /**
   * Stops the router by removing all event listeners
   * @returns {void}
   */
  stop(): void {
    window.removeEventListener('popstate', this._boundPopState);
    document.removeEventListener('click', this._boundClick);
    document.removeEventListener('texivia.goto', this._boundGoto as EventListener);
  }

  /**
   * Click event handler that intercepts link clicks for routing
   * @param {MouseEvent} event - The click event object
   * @private
   */
  private async _onclick(event: MouseEvent): Promise<void> {
    const anchor = (event.target as HTMLElement).closest('a');
    if (!anchor || !anchor.href) return;

    const url = new URL(anchor.href);
    if (url.origin !== window.location.origin) return;
    if (['target', 'download', 'rel', 'no-router'].some(attr => anchor.hasAttribute(attr))) return;
    if (anchor.getAttribute('href')?.startsWith('#')) return;

    event.preventDefault();
    await this._navigate(url, true);
  }

  public async _goto(event: CustomEvent): Promise<void> {
    console.log('Texivia go to:', event.detail);
    this._navigate(new URL(event.detail, window.location.origin), true);
  }

  /**
   * Navigates to the specified URL
   * @param {URL} url - The URL to navigate to
   * @param {boolean} pushState - Whether to add the URL to browser history
   * @returns {MatchedRoute<T> | null} The matched route or null if no match found
   * @private
   */
  private async _navigate(url: URL, pushState: boolean): Promise<MatchedRoute<T> | null> {
    let match = this._match(url.pathname, Object.fromEntries(new URLSearchParams(url.search)), url.hash);
    if (match === null) return null;

    if (match.redirect)
      return this._navigate(new URL(match.redirect, window.location.origin), pushState);

    if (match.handler) {
      const result = await Promise.resolve(match.handler(match));
      if (!result) return null;
      if (typeof result === 'string')
        return this._navigate(new URL(result, window.location.origin), pushState);
    }

    if (pushState)
      window.history.pushState({ path: url.pathname }, '', url);

    document.dispatchEvent(new CustomEvent(Router.EVENT_NAME, { detail: match, bubbles: true }));
    return match;
  }

  /**
   * Matches a path against the defined routes
   * @param {string} path - The path to match
   * @param {Record<string, string>} search - The query parameters
   * @param {string} hash - The URL hash fragment
   * @returns {MatchedRoute<T> | null} The matched route or null if no match found
   * @private
   */
  private _match(path: string, search: Record<string, string>, hash: string): MatchedRoute<T> | null {
    if (!this._mapping)
      return null;

    const matches = this._mapping.exec(path);
    if (!matches || matches[0] !== path)
      return null;

    const index = matches.findIndex((item, i) => i > 0 && item !== undefined);
    if (!index)
      return null;

    const route = this._routes[index - 1];
    if (route.paramRegex) {
      const paramsMatch = route.paramRegex.exec(path);
      const params = paramsMatch ? paramsMatch.groups || {} : {};
      return { ...route, path, params, search, hash };
    }
    return { ...route, path, params: {}, search, hash };
  }

  /**
   * Handles the popstate event when the user navigates browser history
   * @param {PopStateEvent} event - The popstate event object
   * @private
   */
  private async _handlePopState(event: PopStateEvent): Promise<void> {
    this._navigate(new URL(window.location.href), false);
  }
}

export { Router, type MatchedRoute };
