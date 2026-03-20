---
name: UI Layer Patterns
description: UI layer rules for Tailwind CSS v4, DaisyUI v5, Alpine.js v3, Iconify (@iconify/tailwind4 with lucide), HTMX v2, and Hono JSX server rendering. Auto-attached when editing views, components, or CSS files.
---

# UI Layer Rules

## Versions

| Package                | Version |
| ---------------------- | ------- |
| `tailwindcss`          | 4.2.1   |
| `@tailwindcss/cli`     | 4.2.1   |
| `daisyui`              | 5.5.19  |
| `alpinejs`             | 3.15.8  |
| `@types/alpinejs`      | 3.13.11 |
| `@iconify/tailwind4`   | 1.2.3   |
| `@iconify-json/lucide` | 1.2.97  |
| `htmx.org`             | 2.x     |

## CSS File — Single Source of Truth

All UI configuration lives in `src/styles.css`. This file is compiled to `public/styles.css` by the `bun run css` script. **Never create `tailwind.config.js` or `tailwind.config.ts`.**
Source files are scoped via `@source "./**/*.{tsx,ts,html}"` (from `src/styles.css`) — only `src/` is scanned, not node_modules.

```css
@import "tailwindcss";

@plugin "daisyui" {
  themes:
    light --default,
    dark --prefersdark;
}

@plugin "@iconify/tailwind4" {
  prefixes: lucide;
}
```

To change themes, add components, or adjust icon sets, edit `src/styles.css` — not any JavaScript config.

## Tailwind CSS v4

- Configuration is CSS-first — no `tailwind.config.js`.
- Use `@import "tailwindcss"` at the top of `src/styles.css`.
- Custom tokens (colors, spacing, fonts) are defined with `@theme { }` in CSS.
- Utility classes work as normal (`flex`, `gap-4`, `text-sm`, etc.).
- Do not suggest `theme()` function calls in JavaScript — use CSS variables instead.

## Responsive Layout Baseline

- Build mobile-first: start with base classes, then scale up with `sm:`, `md:`, `lg:`, `xl:`.
- Use responsive containers and spacing (`max-w-*`, `p-*`, `gap-*`) so layouts remain readable from phone to desktop.
- Use grid/flex breakpoints for major sections (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`) instead of fixed pixel positioning.
- Ensure tap targets are usable on mobile (`btn-sm`/`btn-md` choices, adequate vertical rhythm).
- For HTMX/Alpine examples in docs or code suggestions, include at least one mobile-safe and one desktop breakpoint pattern.

## DaisyUI v5

- Registered as `@plugin "daisyui"` in CSS — not as a Tailwind plugin in any JS config.
- Component class names changed from v4. Always verify class names against `https://daisyui.com/docs/` before suggesting any DaisyUI component.
- Common component classes: `btn`, `card`, `modal`, `input`, `select`, `badge`, `alert`, `navbar`, `drawer`, `hero`, `table`.
- Themes are declared in the `@plugin` block: `themes: light --default, dark --prefersdark;`
- Do not combine DaisyUI v4 class names with DaisyUI v5 — they are incompatible.

## Iconify — @iconify/tailwind4 (lucide icon set)

**Rule:** Always use exactly two classes: `iconify` (or `iconify-color`) + `lucide--home` style naming. Never use bracket syntax, colon syntax, or other icon sets.
The `@iconify/tailwind4` plugin runs in **clean selector mode** because `prefixes: lucide` is set in `src/styles.css`.
Use exactly: `iconify lucide--home` (replace `home` with a real Lucide icon).
Never use bracket-based icon classes or colon-based icon names.
Always look up icon names at https://icon-sets.iconify.design/lucide/

**Correct icon usage (two-class pattern):**

```html
<!-- Inherits text color (mask image) — use for monochrome icons -->
<span class="iconify lucide--home"></span>

<!-- Hardcoded palette (background image) — use for colored icons -->
<span class="iconify-color lucide--home"></span>
```

**Icon naming convention:** `lucide--home` style — double dash between prefix and icon name.

Browse available icon names at: https://icon-sets.iconify.design/lucide/

**Do not:**

- Use bracket-form icon classes — this project uses clean selectors only.
- Use colon-form icon names — invalid; use double dash format such as `lucide--home`.
- Use other icon sets — only Lucide is configured.
- Import `@iconify/react` — this project uses CSS-only icons.
- Invent icon names — always look up at https://icon-sets.iconify.design/lucide/

**If unsure:** Search https://icon-sets.iconify.design/lucide/ for an exact icon name, then use a real class such as `iconify lucide--home` or `iconify lucide--search`.

## HTMX v2

- Load HTMX from `node_modules/htmx.org/dist/htmx.min.js` (served as a static asset) or a CDN.
- **Event syntax changed in v2:** use `hx-on:htmx:after-request="closeToast()"` not `hx-on-htmx-after-request`.
- Core attributes are unchanged: `hx-get`, `hx-post`, `hx-put`, `hx-delete`, `hx-patch`, `hx-target`, `hx-swap`, `hx-trigger`.
- `hx-swap` values: `innerHTML` (default), `outerHTML`, `beforeend`, `afterend`, `beforebegin`, `afterbegin`, `delete`, `none`.
- Server responses for HTMX requests should return HTML fragments, not JSON.
- Use `HX-Trigger` response header for out-of-band events when needed.

## Alpine.js v3

- Use Alpine for client-only micro-interactions (dropdowns, toggles, tabs, disclosure state) and keep server round-trips in HTMX.
- Canonical directives only: `x-data`, `x-show`, `x-model`, `x-text`, `x-html`, `x-bind`/`:`, `x-on`/`@`, `x-ref`, `x-init`, `x-effect`.
- Canonical magic properties only: `$refs`, `$store`, `$dispatch`, `$watch`, `$nextTick`, `$el`.
- Do not invent directives, magic properties, or lifecycle hooks from other frameworks.
- Do not suggest React/Vue APIs (`useState`, `v-model`, watchers via framework plugins, etc.) in Alpine examples.
- Load Alpine with `defer` in the base HTML shell (from `node_modules/alpinejs/dist/cdn.min.js` or CDN). Ensure it is present before Alpine directives are expected to run.
- For HTMX-updated fragments that include Alpine behavior, ensure Alpine can initialize the swapped markup (for example by processing the swapped subtree after HTMX events).
- Prefer small, local `x-data` scopes over global stores unless shared state is required.

## Hono JSX (Server-Side Rendering)

- JSX in this project is **server-rendered via `hono/jsx`**, configured in `tsconfig.json` with `"jsxImportSource": "hono/jsx"`.
- This is NOT React. There are no hooks (`useState`, `useEffect`, etc.), no client-side state, and no hydration.
- Components are pure functions that return `JSX.Element` (or `Promise<JSX.Element>` for async).
- Import `{ html }` from `hono/html` for raw HTML string responses when not using JSX.
- Route handlers return `c.html(<Component />)` for full-page renders or HTML fragment strings for HTMX responses.

```typescript
import { Hono } from "hono";
const app = new Hono();

app.get("/users", async (c) => {
  const users = await getUsers();
  return c.html(<UserList users={users} />);
});
```

## File Structure Convention

```
src/
  styles.css          ← Tailwind + DaisyUI + Iconify config (source)
  views/
    layout.tsx        ← base HTML shell, loads HTMX + CSS
  home.tsx          ← full-page view example
  components/
    user-card.tsx     ← reusable UI fragment example (returned as HTMX partials)
public/
  styles.css          ← compiled output (do not edit manually)
```

## Context Protocol for UI Features

Attach at session start when building UI:

- `@Tailwind CSS Docs` (https://tailwindcss.com/docs)
- `@DaisyUI Docs` (https://daisyui.com/docs/)
- `@Alpine Docs` (https://alpinejs.dev)
- `@HTMX Docs` (https://htmx.org/docs/)
- `@Iconify Tailwind4 Docs` (https://iconify.design/docs/usage/css/tailwind/tailwind4/)
- `src/styles.css`
