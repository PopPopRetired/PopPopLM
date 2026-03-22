---
name: Project Standards
description: Core project standards, stack version pins, and TypeScript constraints applied to every file in this codebase.
---

# PopPopLM Project Rules

## Stack & Pinned Versions

This project uses the following exact versions. Never suggest APIs, config patterns, or syntax from older versions.

| Package              | Version | Notes                                                                              |
| -------------------- | ------- | ---------------------------------------------------------------------------------- |
| Bun                  | runtime | Use Bun-native APIs; never Node.js equivalents (e.g. `Bun.file` not `fs.readFile`) |
| Hono                 | 4.12.7  | JSX via `hono/jsx` — not React                                                     |
| @mastra/core         | 1.13.2  | v1.x API only — prior beta APIs are invalid                                        |
| mastra CLI           | 1.3.12  |                                                                                    |
| Drizzle ORM          | 0.45.1  |                                                                                    |
| drizzle-kit          | 0.31.9  |                                                                                    |
| drizzle-zod          | 0.8.3   |                                                                                    |
| @libsql/client       | 0.17.0  |                                                                                    |
| Zod                  | 4.3.6   | **v4 — breaking changes from v3**                                                  |
| @ai-sdk/openai       | 3.0.47  | Standard AI provider for text generation                                           |
| @xenova/transformers | 2.17.2  | Used for chunking and processing texts for RAG embeddings                          |
| pdf-parse            | 2.4.5   | **MUST use class-based API**: `new PDFParse({ data: buffer })`                     |
| cheerio              | 1.2.0   | HTML extraction tool                                                               |
| youtube-transcript   | 1.3.0   | YouTube transcript extraction via `YoutubeTranscript.fetchTranscript(url)`         |
| alpinejs             | 3.15.8  | **v3 — use Alpine directives/magics exactly as documented**                        |
| @types/alpinejs      | 3.13.11 | TypeScript types for Alpine usage in scripts                                       |
| HTMX                 | 2.x     | **v2 — event/attribute syntax changed from v1**                                    |
| Tailwind CSS         | 4.2.1   | **v4 — CSS-first, no tailwind.config.js**                                          |
| DaisyUI              | 5.5.19  | **v5 — registered via @plugin in CSS**                                             |
| @iconify/tailwind4   | 1.2.3   | CSS-first plugin, `prefixes: lucide`                                               |
| @iconify-json/lucide | 1.2.97  | Icon set prefix: `lucide`                                                          |
| @hono/zod-validator  | 0.7.6   |                                                                                    |

## TypeScript

- `strict: true` is enforced in `tsconfig.json` — do not suggest code that requires loosening it.
- `moduleResolution: "bundler"` — use ESM import paths; never `.js` extension workarounds.
- `jsxImportSource: "hono/jsx"` — JSX is server-side Hono JSX, not React. No hooks, no `useState`, no `useEffect`.
- All files are ESM (`"type": "module"` in package.json). Never use `require()` or `module.exports`.

## General Coding Standards

- Prefer functional patterns; avoid classes except where a library requires them.
- No raw SQL strings — always use the Drizzle ORM query builder.
- Validate all external input with Zod v4 before it reaches business logic or the database.
- Colocate test files with their source: `src/foo/bar.ts` → `src/foo/bar.test.ts`.
- For the current scaffold, use: `src/index.tsx` → `src/index.test.ts` and `src/db/queries/users.ts` → `src/db/queries/users.test.ts`.

## Test Execution Expectations

- Use a balanced workflow: add/update tests when behavior changes.
- During implementation, run targeted tests in touched areas (for example `bun test src/db/` or `bun test src/index.test.ts`).
- Before claiming feature completion, run full `bun test`.
- Prefer `bun test --watch` for rapid local feedback loops while actively building.
- Defer enforced hooks/CI test gates until explicitly enabled by the project roadmap.

## Test Trigger Checklist

- Create a new `*.test.ts` file when you add a new module with meaningful behavior (route group, query helper, schema set, tool/workflow).
- Update an existing test file when behavior changes in that module.
- Add a regression test for every bug fix.
- If behavior changed and no assertion changed, treat that as a missing-test signal.

## Check-Before-Write Rule

Before suggesting any code involving the packages below, verify the syntax against the attached documentation or use Context7 MCP to fetch the current API:

- **Mastra** — v1.x APIs changed significantly from beta; always confirm `Agent`, `Tool`, `Workflow` constructor signatures.
- **Zod v4** — schema inference, `.default()`, `.brand()`, and error map APIs differ from v3.
- **Tailwind v4** — no JS config; all configuration lives in CSS via `@import` and `@plugin`.
- **DaisyUI v5** — component class names changed from v4; verify before suggesting any component class.
- **Alpine.js v3** — directive and magic-property syntax is strict (`x-data`, `x-on`/`@`, `x-bind`/`:`); never invent directives or Vue/React patterns.
- **HTMX v2** — event name prefix changed; verify `hx-on:` syntax and removed attributes.
- **Iconify @iconify/tailwind4** — icon class syntax is `iconify lucide--home`; never use bracket or colon icon syntax, and never use React Iconify imports.
