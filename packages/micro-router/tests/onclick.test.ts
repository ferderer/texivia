import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Router } from '../src/texivia-micro';

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
    // Create an anchor element with the same origin as window.location
    const anchor = document.createElement('a');
    anchor.href = window.location.origin + '/about';
    document.body.appendChild(anchor);

    // Create a click event
    const event = new MouseEvent('click', {
      bubbles: true,
      cancelable: true
    });
    Object.defineProperty(event, 'target', { value: anchor });

    const preventDefault = vi.spyOn(event, 'preventDefault');

    // Trigger the click handler
    await triggerClick(router, event);

    // Verify the event was prevented and navigation was attempted
    expect(preventDefault).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(expect.any(URL), true);

    document.body.removeChild(anchor);
  });

  it('ignores clicks on external links', async () => {
    // Create an external anchor
    const anchor = document.createElement('a');
    anchor.href = 'https://external-site.com/page';
    document.body.appendChild(anchor);

    // Create a click event
    const event = new MouseEvent('click', {
      bubbles: true,
      cancelable: true
    });
    Object.defineProperty(event, 'target', { value: anchor });

    const preventDefault = vi.spyOn(event, 'preventDefault');

    // Trigger the click handler
    await triggerClick(router, event);

    // Verify the event was not prevented
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
    anchor.setAttribute('rel', 'nofollow');
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
    // Create nested structure: a > span > i
    const anchor = document.createElement('a');
    anchor.href = window.location.origin + '/about';

    const span = document.createElement('span');
    const icon = document.createElement('i');

    span.appendChild(icon);
    anchor.appendChild(span);
    document.body.appendChild(anchor);

    // Click on the innermost element
    const event = new MouseEvent('click');
    Object.defineProperty(event, 'target', { value: icon });

    const preventDefault = vi.spyOn(event, 'preventDefault');

    await triggerClick(router, event);

    // Should still detect the parent anchor and handle the navigation
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
});
