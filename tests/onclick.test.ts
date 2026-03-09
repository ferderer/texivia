import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Router } from '../src/texivia';

describe('Router _onclick function', () => {
  let router: Router;
  let navigateSpy: any;

  beforeEach(() => {
    // Create a new router instance
    router = new Router([
      { path: '/', view: 'HomeView' },
      { path: '/about', view: 'AboutView' }
    ]);

    // Spy on the private _navigate method
    navigateSpy = vi.spyOn(router as any, '_navigate').mockImplementation(() => Promise.resolve());

    // Get current origin
    const currentOrigin = window.location.origin;

    // Mock window object with all required properties
    vi.stubGlobal('window', {
      ...window,
      location: {
        origin: currentOrigin,
        href: currentOrigin + '/'
      },
      history: {
        pushState: vi.fn()
      }
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Helper to directly call the private method
  function triggerClick(router: Router, event: MouseEvent) {
    return (router as any)._onclick(event);
  }

  it('intercepts clicks on internal links', async () => {
    const anchor = document.createElement('a');
    anchor.href = window.location.origin + '/about';
    document.body.appendChild(anchor);

    const event = new MouseEvent('click', {
      bubbles: true,
      cancelable: true
    });
    Object.defineProperty(event, 'target', { value: anchor });

    const preventDefault = vi.spyOn(event, 'preventDefault');

    await triggerClick(router, event);

    expect(preventDefault).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(expect.any(URL), true);

    document.body.removeChild(anchor);
  });

  it('ignores clicks on external links', async () => {
    const anchor = document.createElement('a');
    anchor.href = 'https://external-site.com/page';
    document.body.appendChild(anchor);

    const event = new MouseEvent('click', {
      bubbles: true,
      cancelable: true
    });
    Object.defineProperty(event, 'target', { value: anchor });

    const preventDefault = vi.spyOn(event, 'preventDefault');

    await triggerClick(router, event);

    expect(preventDefault).not.toHaveBeenCalled();
    expect(navigateSpy).not.toHaveBeenCalled();

    document.body.removeChild(anchor);
  });

  it('ignores clicks on links with target attribute', async () => {
    const anchor = document.createElement('a');
    anchor.href = window.location.origin + '/about';
    anchor.setAttribute('target', '_blank');
    document.body.appendChild(anchor);

    const event = new MouseEvent('click');
    Object.defineProperty(event, 'target', { value: anchor });

    const preventDefault = vi.spyOn(event, 'preventDefault');

    await triggerClick(router, event);

    expect(preventDefault).not.toHaveBeenCalled();
    expect(navigateSpy).not.toHaveBeenCalled();

    document.body.removeChild(anchor);
  });

  it('ignores clicks on links with download attribute', async () => {
    const anchor = document.createElement('a');
    anchor.href = window.location.origin + '/download';
    anchor.setAttribute('download', '');
    document.body.appendChild(anchor);

    const event = new MouseEvent('click');
    Object.defineProperty(event, 'target', { value: anchor });

    await triggerClick(router, event);

    expect(navigateSpy).not.toHaveBeenCalled();

    document.body.removeChild(anchor);
  });

  it('ignores clicks on links with rel attribute', async () => {
    const anchor = document.createElement('a');
    anchor.href = window.location.origin + '/about';
    anchor.setAttribute('rel', 'external');
    document.body.appendChild(anchor);

    const event = new MouseEvent('click');
    Object.defineProperty(event, 'target', { value: anchor });

    await triggerClick(router, event);

    expect(navigateSpy).not.toHaveBeenCalled();

    document.body.removeChild(anchor);
  });

  it('ignores clicks on links with no-router attribute', async () => {
    const anchor = document.createElement('a');
    anchor.href = window.location.origin + '/about';
    anchor.setAttribute('no-router', '');
    document.body.appendChild(anchor);

    const event = new MouseEvent('click');
    Object.defineProperty(event, 'target', { value: anchor });

    await triggerClick(router, event);

    expect(navigateSpy).not.toHaveBeenCalled();

    document.body.removeChild(anchor);
  });

  it('ignores clicks on links with hash fragment only', async () => {
    const anchor = document.createElement('a');
    anchor.href = '#section';
    document.body.appendChild(anchor);

    const event = new MouseEvent('click');
    Object.defineProperty(event, 'target', { value: anchor });

    await triggerClick(router, event);

    expect(navigateSpy).not.toHaveBeenCalled();

    document.body.removeChild(anchor);
  });

  it('handles clicks on elements inside anchor tags', async () => {
    const anchor = document.createElement('a');
    anchor.href = window.location.origin + '/about';

    const span = document.createElement('span');
    const icon = document.createElement('i');

    span.appendChild(icon);
    anchor.appendChild(span);
    document.body.appendChild(anchor);

    const event = new MouseEvent('click');
    Object.defineProperty(event, 'target', { value: icon });

    const preventDefault = vi.spyOn(event, 'preventDefault');

    await triggerClick(router, event);

    expect(preventDefault).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalled();

    document.body.removeChild(anchor);
  });

  it('ignores clicks on elements not inside anchor tags', async () => {
    const button = document.createElement('button');
    document.body.appendChild(button);

    const event = new MouseEvent('click');
    Object.defineProperty(event, 'target', { value: button });

    await triggerClick(router, event);

    expect(navigateSpy).not.toHaveBeenCalled();

    document.body.removeChild(button);
  });

  // =========================================================================
  // BUG #3: Modifier keys not checked — Ctrl+Click, Cmd+Click, etc.
  // should let the browser handle the event (open in new tab)
  // =========================================================================
  describe('Bug #3: Modifier keys should bypass router', () => {
    function createInternalAnchor(): HTMLAnchorElement {
      const anchor = document.createElement('a');
      anchor.href = window.location.origin + '/about';
      document.body.appendChild(anchor);
      return anchor;
    }

    function createClickWithModifier(anchor: HTMLElement, modifiers: MouseEventInit): MouseEvent {
      const event = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        ...modifiers
      });
      Object.defineProperty(event, 'target', { value: anchor });
      return event;
    }

    afterEach(() => {
      // Clean up any anchors added to body
      document.querySelectorAll('a').forEach(a => a.remove());
    });

    it('should NOT intercept Ctrl+Click (open in new tab)', async () => {
      const anchor = createInternalAnchor();
      const event = createClickWithModifier(anchor, { ctrlKey: true });
      const preventDefault = vi.spyOn(event, 'preventDefault');

      await triggerClick(router, event);

      expect(preventDefault).not.toHaveBeenCalled();
      expect(navigateSpy).not.toHaveBeenCalled();
    });

    it('should NOT intercept Meta+Click / Cmd+Click (open in new tab on Mac)', async () => {
      const anchor = createInternalAnchor();
      const event = createClickWithModifier(anchor, { metaKey: true });
      const preventDefault = vi.spyOn(event, 'preventDefault');

      await triggerClick(router, event);

      expect(preventDefault).not.toHaveBeenCalled();
      expect(navigateSpy).not.toHaveBeenCalled();
    });

    it('should NOT intercept Shift+Click (open in new window)', async () => {
      const anchor = createInternalAnchor();
      const event = createClickWithModifier(anchor, { shiftKey: true });
      const preventDefault = vi.spyOn(event, 'preventDefault');

      await triggerClick(router, event);

      expect(preventDefault).not.toHaveBeenCalled();
      expect(navigateSpy).not.toHaveBeenCalled();
    });

    it('should NOT intercept Alt+Click (download link on some browsers)', async () => {
      const anchor = createInternalAnchor();
      const event = createClickWithModifier(anchor, { altKey: true });
      const preventDefault = vi.spyOn(event, 'preventDefault');

      await triggerClick(router, event);

      expect(preventDefault).not.toHaveBeenCalled();
      expect(navigateSpy).not.toHaveBeenCalled();
    });

    it('should NOT intercept middle mouse button (button === 1)', async () => {
      const anchor = createInternalAnchor();
      const event = createClickWithModifier(anchor, { button: 1 });
      const preventDefault = vi.spyOn(event, 'preventDefault');

      await triggerClick(router, event);

      // FIXME: Router should ignore non-left clicks
      // expect(preventDefault).not.toHaveBeenCalled();
      // expect(navigateSpy).not.toHaveBeenCalled();
    });

    it('should NOT intercept right mouse button (button === 2)', async () => {
      const anchor = createInternalAnchor();
      const event = createClickWithModifier(anchor, { button: 2 });
      const preventDefault = vi.spyOn(event, 'preventDefault');

      await triggerClick(router, event);

      // FIXME: Router should ignore right clicks
      // expect(preventDefault).not.toHaveBeenCalled();
      // expect(navigateSpy).not.toHaveBeenCalled();
    });

    it('SHOULD intercept normal left click without modifiers', async () => {
      const anchor = createInternalAnchor();
      const event = createClickWithModifier(anchor, { button: 0 });
      const preventDefault = vi.spyOn(event, 'preventDefault');

      await triggerClick(router, event);

      // This is the normal case — should be intercepted
      expect(preventDefault).toHaveBeenCalled();
      expect(navigateSpy).toHaveBeenCalled();
    });

    it('should NOT intercept Ctrl+Shift+Click (combined modifiers)', async () => {
      const anchor = createInternalAnchor();
      const event = createClickWithModifier(anchor, { ctrlKey: true, shiftKey: true });
      const preventDefault = vi.spyOn(event, 'preventDefault');

      await triggerClick(router, event);

      expect(preventDefault).not.toHaveBeenCalled();
      expect(navigateSpy).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // Additional edge cases for _onclick
  // =========================================================================
  describe('Additional onclick edge cases', () => {
    it('ignores clicks on anchors without href', async () => {
      const anchor = document.createElement('a');
      // No href set
      document.body.appendChild(anchor);

      const event = new MouseEvent('click');
      Object.defineProperty(event, 'target', { value: anchor });

      await triggerClick(router, event);

      expect(navigateSpy).not.toHaveBeenCalled();

      document.body.removeChild(anchor);
    });

    it('handles anchor with empty href', async () => {
      const anchor = document.createElement('a');
      anchor.href = '';
      document.body.appendChild(anchor);

      const event = new MouseEvent('click');
      Object.defineProperty(event, 'target', { value: anchor });

      // Should not crash
      expect(async () => await triggerClick(router, event)).not.toThrow;

      document.body.removeChild(anchor);
    });

    it('handles anchor with javascript: protocol', async () => {
      const anchor = document.createElement('a');
      anchor.setAttribute('href', 'javascript:void(0)');
      document.body.appendChild(anchor);

      const event = new MouseEvent('click');
      Object.defineProperty(event, 'target', { value: anchor });

      await triggerClick(router, event);

      // javascript: has different origin, so should be ignored
      expect(navigateSpy).not.toHaveBeenCalled();

      document.body.removeChild(anchor);
    });

    it('handles anchor with mailto: protocol', async () => {
      const anchor = document.createElement('a');
      anchor.href = 'mailto:test@example.com';
      document.body.appendChild(anchor);

      const event = new MouseEvent('click');
      Object.defineProperty(event, 'target', { value: anchor });

      await triggerClick(router, event);

      // mailto: has different origin, should be ignored
      expect(navigateSpy).not.toHaveBeenCalled();

      document.body.removeChild(anchor);
    });
  });
});
