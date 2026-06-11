---
status: completed
date: 2026-06-12
---

# Step 01 - Observation IR Ingestion

## Goal

Turn the initial Observation IR schemas into a validated local ingestion path.

This step should make it possible for Browser Worker to send factual events to Backend API and for Backend API to persist enough local evidence for later timeline, analysis, and replay work.

## Source Documents

- [Project State](../../project/state.md)
- [P0 Scope](../product/p0-scope.md)
- [System Overview](../architecture/overview.md)
- [Observation IR](../domain/observation-ir.md)
- [Step 00 - Project Bootstrap](./2026-06-12-step-00-project-bootstrap.md)

## Requirements

- Keep Observation IR factual and interpretation-free.
- Validate every ingested event against the shared schema.
- Preserve event order with `sessionId`, `timestamp`, and `sequence`.
- Keep large payloads behind artifact references rather than inline fields.
- Make sensitive data visible in the model through tags or artifact metadata.
- Keep the storage local-first.

## Solution Direction

- Add Backend API routes for recording sessions and event ingestion.
- Add a local persistence adapter backed by SQLite for session and event indexes.
- Store large artifacts under a local `.bwc/artifacts/` directory and reference them from Observation IR.
- Add schema tests for representative browser, network, storage, and replay events.
- Update Browser Worker smoke to optionally post a `browser.session_started` event to Backend API.
- Keep action-request linking, Evidence Graph generation, Workflow IR generation, and replay out of this step.

## Proposed API Surface

```text
POST /sessions
GET /sessions
GET /sessions/:sessionId
POST /sessions/:sessionId/events
GET /sessions/:sessionId/events
```

## Tasks

- [x] Finalize P0 Observation Event schema details.
- [x] Add schema validation tests for P0 event types.
- [x] Add recording session API routes.
- [x] Add event ingestion API route.
- [x] Add local SQLite persistence adapter.
- [x] Add artifact directory conventions.
- [x] Add Browser Worker smoke mode that posts one event to Backend API.
- [x] Add testing notes for Observation IR ingestion.
- [x] Update module docs for Backend API and Browser Worker.
- [x] Update [Project State](../../project/state.md) when complete.

## Acceptance Criteria

- [x] Backend API can create a local recording session.
- [x] Backend API rejects invalid Observation IR events.
- [x] Backend API accepts valid Observation IR events.
- [x] Events can be read back in session order.
- [x] Browser Worker can post at least one smoke event to Backend API.
- [x] Local data is stored under a documented `.bwc/` path.
- [x] Typecheck and tests pass.

## Implementation Summary

Step 01 added:

- Backend API routes for recording sessions and Observation IR events.
- SQLite-backed local storage under `.bwc/bwc.sqlite`.
- Artifact directory convention under `.bwc/artifacts/`.
- `@bwc/api-client` for shared API access.
- Browser Worker smoke support for posting a `browser.session_started` event to Backend API.
- Frontend component and style-token split for the Web Console placeholder.
- Node 24 LTS project baseline and Biome format/lint commands.

## Verification

See [Step 01 Verification](../testing/2026-06-12-step-01-verification.md).

## Non-scope

- Real browser action capture.
- Real fetch/XHR network capture.
- Action-request linking.
- Evidence Graph persistence.
- Workflow IR generation.
- Replay engine implementation.
