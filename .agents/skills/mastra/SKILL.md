---
name: Mastra AI Agent Patterns
description: Mastra v1.x AI agent patterns, tool/workflow construction, memory, logging, and Hono adapter usage. Auto-attached when editing files under src/mastra/.
---

# Mastra Agent Rules

## Version

`@mastra/core` 1.13.2 — `mastra` CLI 1.3.12. The v1.x API is a breaking change from all pre-1.0 betas. All prior Mastra code examples on the internet are likely invalid. Always use the attached `@Mastra Docs` or Context7 MCP to confirm current API signatures before writing code.

## Package Roles

| Package | Role |
|---|---|
| `@mastra/core` | Agent, Tool, Workflow, MastraClient primitives |
| `mastra` | CLI — `mastra dev` for the local Mastra Studio |
| `@mastra/hono` | Hono adapter — mounts the Mastra API onto the Hono app |
| `@mastra/memory` | Conversation memory backed by a storage provider |
| `@mastra/libsql` | libSQL storage adapter for memory and other persistence |
| `@mastra/loggers` | Structured logging for agents and workflows |
| `@mastra/observability` | Tracing/telemetry — view in Mastra Studio |

## Agent Construction

- Define agents using the `Agent` constructor from `@mastra/core`.
- Tools are defined with the `createTool` helper and attached to agents via the `tools` array.
- Workflows use the `Workflow` class with typed step definitions.
- Always provide explicit TypeScript types for tool input/output schemas using Zod v4.
- Agent memory is configured via `@mastra/memory` with a `@mastra/libsql` storage adapter — do not invent custom memory adapters.

## Hono Adapter

- Use `@mastra/hono` to mount Mastra routes onto the Hono application.
- Do not manually define agent HTTP endpoints; use the adapter's mount pattern.

**Correct Usage Pattern (Mastra v1.x + Hono):**
```typescript
import { Hono } from 'hono';
import { MastraServer } from '@mastra/hono';
import { mastra } from './mastra';
import type { AppEnv } from '../../types'; // Adjust path depending on file location

// Initialize Hono with the central project AppEnv
const app = new Hono<AppEnv>();

// Mount Mastra onto the Hono app
const server = new MastraServer({ app, mastra });
await server.init();

export default app;
```

## File Structure Convention

```
src/mastra/
  index.ts          ← Mastra instance (registers agents, tools, workflows)
  agents/
    weather-agent.ts       ← one file per agent
  tools/
    weather-tool.ts        ← one file per tool
  workflows/
    weather-workflow.ts    ← one file per workflow
```

## Context Protocol for Agent Features

Attach these when building anything in this directory:

- `@Mastra Docs` (https://mastra.ai/docs)
- `src/mastra/index.ts`
- The specific agent/tool file being modified
- `src/db/index.ts` if the agent reads/writes the database

## Hallucination Traps to Avoid

- Do not use `new Mastra()` patterns from pre-1.0 docs — the instantiation API changed.
- Do not fabricate method names on `Agent` or `Tool` — they will not exist.
- Do not combine Mastra memory with custom SQLite queries; use the `@mastra/libsql` adapter exclusively.
- Never call `mastra dev` as an API — it is a CLI command only.
