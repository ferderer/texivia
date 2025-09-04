### Microfrontend Support in Texivia Router

Microfrontends (MFs) allow different parts of a web application to be developed, deployed, and maintained independently, often using different frameworks. Texivia Router’s design as a lightweight, framework-agnostic routing library makes it well-suited for MF architectures. Below are the key MF-related features and discussions, their purpose, and their implementation status in version 1.0.

#### 1. **URL Prefixing**
- **Purpose**: Ensures each MF’s router handles routes within its own URL namespace (e.g., `/app1/*` for MF1, `/app2/*` for MF2), preventing conflicts and maintaining isolation.
- **Implementation**:
  - Added to `RouterOptions` as `prefix` (default: `''`).
  - Prepended to route paths during compilation in `_process` (e.g., `this.prefix + routeConfig.path`).
  - Used in `_handleClick` to intercept only links starting with the prefix.
- **Status**: Implemented in version 1.0.
- **Discussion**: Initially, there was a concern about double slashes (e.g., `/prefix//route`). You preferred minimal interference with developer input, so normalization was suggested as a comment in the code to raise awareness without enforcing changes.

#### 2. **Configurable Event Names**
- **Purpose**: Prevents event clashes between MF routers by allowing each to use a unique event name for navigation updates (e.g., `app1-navigate` vs. `app2-navigate`).
- **Implementation**:
  - Added to `RouterOptions` as `eventName` (default: `'texivia'`).
  - Used in `_dispatchEvent` to emit navigation events.
  - Extended to delegation events (e.g., `${this.eventName}-delegate`) to handle unmatched routes.
- **Status**: Implemented in version 1.0.
- **Discussion**: A TypeScript issue with dynamic event names (`${this.eventName}-delegate` not matching `DocumentEventMap`) was resolved by casting events to `CustomEvent`, ensuring flexibility without requiring a fixed event name.

#### 3. **Ignoring Unknown Routes**
- **Purpose**: Allows a router to skip unmatched routes (instead of falling back to a `notFound` route), enabling other MF routers to handle them, which is crucial for isolation and coordination.
- **Implementation**:
  - Added to `RouterOptions` as `ignoreUnknown` (default: `false`).
  - In `_matchRoute`, returns `null` for unmatched paths when `ignoreUnknown` is `true`, bypassing the `notFound` route.
- **Status**: Implemented in version 1.0.
- **Discussion**: This ensures that each MF router only processes its own routes, leaving unmatched ones for other routers to pick up, supporting independent operation.

#### 4. **Delegation Events for Unmatched Routes**
- **Purpose**: When a router cannot handle a route, it emits a delegation event to allow other MF routers to attempt navigation, facilitating cross-MF coordination.
- **Implementation**:
  - Added to `RouterOptions` as `delegateUnknown` (default: `false`).
  - In `navigate`, emits a `'texivia-delegate'` event with `{ path, router: this.routerName }` when a route is unmatched and `delegateUnknown` is `true`.
  - `_onDelegate` listens for this event, checks if the sender (`router`) differs from `this.routerName`, and navigates if the path matches a local route.
- **Status**: Implemented in version 1.0.
- **Discussion**: You raised a concern about potential delegation loops. However, since `_onDelegate` only navigates if a route matches (and matched routes don’t delegate further), loops are naturally prevented. A suggestion to track attempted routers was deemed unnecessary but noted for edge cases.

#### 5. **Router Name for Delegation**
- **Purpose**: Identifies the router emitting a delegation event to prevent a router from processing its own delegated paths, ensuring proper MF isolation.
- **Implementation**:
  - Added to `RouterOptions` as `routerName` (default: `null`).
  - Included in the `'texivia-delegate'` event’s `detail` to distinguish the sender.
  - In `_onDelegate`, checks `event.detail.router !== this.routerName` before attempting navigation.
- **Status**: Implemented in version 1.0.
- **Discussion**: This was a critical addition to avoid self-delegation, making the delegation mechanism robust for MF scenarios.

#### 6. **Disabling Link Interception**
- **Purpose**: Allows developers to opt out of automatic link interception, giving control to other systems or routers in an MF setup, enhancing flexibility.
- **Implementation**:
  - Added to `RouterOptions` as `interceptLinks` (default: `true`).
  - In `start`, conditionally adds the click event listener based on `this.interceptLinks`.
  - In `_handleClick`, only intercepts links matching `this.prefix`, ensuring isolation between MFs.
- **Status**: Implemented in version 1.0.
- **Discussion**: Your updated `_handleClick` already isolates link handling by prefix, and the `interceptLinks` option adds further flexibility, making it ideal for MFs where only specific routers should handle certain links.

#### 7. **Dynamic Route Management (`addRoute`/`removeRoute`)**
- **Purpose**: Enables runtime addition or removal of routes, supporting dynamic loading of MFs without predefined routes.
- **Implementation**: Not implemented in version 1.0; postponed to a future version.
- **Discussion**: You acknowledged the value for MFs, where routes might be registered as MFs load, but chose to defer it to keep version 1.0 lean. Planned for a future release and communicated to users as such.

#### 8. **Lifecycle Management with `onExit` Hooks**
- **Purpose**: Allows cleanup or lifecycle tasks (e.g., unmounting an MF) when leaving a route, critical for MF lifecycle coordination.
- **Implementation**: Not implemented in version 1.0; postponed to a future version.
- **Discussion**: We discussed that `onExit` hooks would complement `onEnter` (existing hooks) for complete lifecycle control, especially in MFs. You opted to delay this to prioritize simplicity, with plans to include it later.

## Summary
Texivia Router version 1.0 is well-equipped for microfrontends with the following implemented features:
- **URL Prefixing**: Scopes routes to specific MFs using `prefix`.
- **Configurable Event Names**: Avoids event clashes with `eventName`.
- **Ignoring Unknown Routes**: Skips unmatched routes with `ignoreUnknown`.
- **Delegation Events**: Coordinates navigation across MFs with `delegateUnknown` and `routerName`.
- **Disabling Link Interception**: Provides control with `interceptLinks`.

Deferred features include:
- **Dynamic Route Management**: `addRoute`/`removeRoute` for runtime flexibility.
- **onExit Hooks**: For lifecycle cleanup, particularly useful in MFs.

These features make Texivia competitive with microfrontend-focused routers like single-spa, while its lightweight (~2KB gzipped) and framework-agnostic nature keeps it simpler and more versatile. The deferred features are planned for future versions, and you’ve noted they’ll be communicated to users, ensuring transparency.
