# Texivia Router

Texivia Router, from Latin "via" (way/road) and textor (weaver) – "path weaver" – is a lightweight, framework-agnostic JavaScript router that uses regex-based path matching for flexible and powerful route handling. It’s designed to work seamlessly with any JavaScript framework (like Svelte, React, or Vue) or even plain JavaScript projects. With Texivia Router, you can define named routes, handle dynamic parameters, manage redirects, and execute hooks for navigation control.

## Features
Texivia Router combines power and simplicity, delivering a robust set of features to streamline routing in JavaScript applications. Here’s what it offers:

- **Plain TypeScript, Framework-Agnostic**: Built with vanilla TS, it integrates effortlessly with any framework—be it Svelte, React, Vue, or no framework at all.
- **Type-Safe Routes**: Catch errors early with TypeScript support for route configurations, enhancing code reliability and maintainability.
- **Fast Route Matching**: Routes are compiled into a single, efficient regex pattern (e.g., /^(?<users>\/users\/[^/]+)|...|$), ensuring quick and optimized path resolution.
- **Dynamic Path Parameters**: Create flexible routes like /users/{id:\\d+} with regex constraints, giving you precise control over parameter formats.
- **Nesting via Components**: Easily manage nested routes within your components, offering a flexible, framework-agnostic approach to hierarchical routing.
- **Synchronous Navigation Hooks**: Global and per-route hooks enable tasks like authentication or locale setting, with the ability to redirect—all handled synchronously for reliability.
- **Smooth History Management**: Using the History API (pushState, replaceState, popstate), it keeps navigation seamless and URLs in sync.
- **Named Routes**: Navigate using route names instead of hardcoding URLs, enhancing code clarity and maintainability.
- **Simple Redirects**: Define redirects directly in the configuration (e.g., /old -> /new) for effortless user redirection.
- **Effortless 404 Handling**: A * route, named NotFound, automatically manages unmatched paths with ease.
- **Event-Driven Design**: Each navigation fires a texivia custom event, delivering details like component name, path, and query parameters for easy integration.
- **Relative Link Interception**: Clicks on relative links are automatically handled by the router, ensuring a fluid single-page app experience.

This updated section seamlessly integrates Type-Safe Routes, highlighting the benefit of TypeScript support for catching errors at compile time, and Nesting via Components, emphasizing the ability to manage nested routes through components in a way that works across different frameworks. The tone and structure remain consistent with the original, keeping the list concise and benefit-focused.


## Installation

To install Texivia Router, use npm or yarn:

```bash
npm install texivia-router
```

## Basic Usage
Here’s a simple example to get you started:
```javascript
import { Router } from 'texivia-router';

const routes = {
  Home: { path: '/' },
  About: { path: '/about' },
  NotFound: { path: '*' }
};

const router = new Router(routes);
router.start();
```

This sets up a basic router with three routes: Home, About, and a catch-all NotFound route.

## Configuration
Routes are defined as an object where each key is the route name, and the value is an object with at least a path property. You can also add hooks or redirects:
```javascript

const routes = {
  Home: { path: '/' },
  User: { path: '/users/{id}', hooks: [authHook] },
  OldPage: { path: '/old', redirect: '/new' },
  NotFound: { path: '*' }
};
```

- Parameters: Use {paramName} in the path to define dynamic segments. You can also specify regex patterns, like {id:\\d+} for numeric IDs.
- Hooks: Functions that run before navigation. They can cancel navigation, redirect, or allow it to proceed.
- Redirects: Automatically redirect from one route to another.

## Navigation
You can navigate programmatically using `navigate` or `navigateToNamed`:
```javascript
router.navigate('/about'); // Navigates to /about
router.navigateToNamed('User', { id: '123' }); // Navigates to /users/123
```

The router also dispatches a custom `texivia` event on navigation, which you can listen to for updates:
```javascript
document.addEventListener('texivia', (event) => {
  console.log(event.detail.route, event.detail.params);
});
```

## Hooks
Hooks allow you to control navigation. They can be global or route-specific:
```javascript
const authHook = (route, params) => {
  if (!isLoggedIn()) {
    return '/login'; // Redirect to login
  }
  return true; // Allow navigation
};

const router = new Router(routes, [globalHook]);
```
- Return true to allow navigation.
- Return false to cancel navigation.
- Return a string to redirect to that path.

## API Reference
- `new Router(routes, hooks)`: Creates a new router instance.
- `router.start()`: Starts the router and attaches event listeners.
- `router.stop()`: Stops the router and removes event listeners.
- `router.navigate(path, pushState = true)`: Navigates to a path.
- `router.navigateToNamed(name, params, pushState = true)`: Navigates to a named route with parameters.
- `router.generateUrl(name, params, query)`: Generates a URL for a named route.

# Testing
Texivia Router is thoroughly tested with Vitest, covering route matching, navigation, hooks, and edge cases. You can find the test suite in the `tests` directory.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request on GitHub.
