# Local Runtime Modules

## Purpose

The local runtime modules are the first executable boundaries for Browser Workflow Compiler.

They keep UI, API, browser automation, and shared IR schemas separate while still allowing fast local development in one workspace.

## Current Structure

```text
apps/
  web-console/
  backend-api/
  browser-worker/

packages/
  api-client/
  shared/
  observation-ir/
  workflow-ir/
```

## Apps

### Web Console

Path: `apps/web-console`

Current role:

- React/Vite placeholder for the local workbench.
- Imports shared recording session and observation event types.
- Shows a static session timeline and inspector shell.

### Backend API

Path: `apps/backend-api`

Current role:

- Fastify service.
- Exposes `GET /health`.
- Exposes recording session routes:
  - `POST /sessions`
  - `GET /sessions`
  - `GET /sessions/:sessionId`
- Exposes Observation IR event routes:
  - `POST /sessions/:sessionId/events`
  - `GET /sessions/:sessionId/events`
- Persists sessions and events with local SQLite under `.bwc/bwc.sqlite`.
- Creates `.bwc/artifacts/` as the artifact directory convention.
- Has Vitest coverage for health, session creation, invalid event rejection, valid event ingestion, ordering, and session mismatch rejection.

### Browser Worker

Path: `apps/browser-worker`

Current role:

- Playwright runtime placeholder.
- Provides a recorder-backed smoke command that launches Chromium.
- Captures `browser.session_started`, `browser.navigate`, and `browser.session_stopped`.
- Captures fetch/XHR `network.request` and `network.response` events.
- Filters obvious static assets from network observations.
- Adds request IDs, timing, JSON/GraphQL/sensitive tags, and header/body artifact reference conventions.
- Preserves monotonic event sequence values with `EventSequencer`.
- Can post captured browser and network events to Backend API when run with `--api` or `BWC_API_URL`.

## Packages

### API Client

Path: `packages/api-client`

Current role:

- Shared fetch client for Backend API.
- Supports health, session, and event ingestion/readback methods.
- Used by Browser Worker smoke.

### Shared

Path: `packages/shared`

Current role:

- Shared actor schema.
- Recording session schema and type.
- Small ID and timestamp helpers.

### Observation IR

Path: `packages/observation-ir`

Current role:

- P0 observation event type schema.
- Artifact reference schema.
- Observation event envelope schema and type.

### Workflow IR

Path: `packages/workflow-ir`

Current role:

- Minimal Workflow IR schema.
- Minimal `http.request` step schema.

## Maintenance Notes

- Keep shared packages factual and dependency-light.
- Do not put analysis results into Observation IR.
- Do not put Playwright-specific runtime details into shared IR packages unless they are durable facts.
- Keep persistence behind Backend API rather than inside Browser Worker.
- Keep Browser Worker communication through `@bwc/api-client` to avoid duplicate fetch logic.
