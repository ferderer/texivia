---
"texivia-router": patch
---

README: add the `texivia` listener **before** calling `router.start()`. `start()` dispatches the event for the current URL during the call, so with the listener added afterwards the first page is never rendered (a reload or deep link showed the start page). The Quick Start and the Svelte and Vue examples had the wrong order.
