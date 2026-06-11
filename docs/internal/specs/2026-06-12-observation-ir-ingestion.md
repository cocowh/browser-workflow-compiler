---
status: implemented
date: 2026-06-12
---

# Observation IR Ingestion

## Purpose

Provide the first validated local ingestion path for factual browser workflow observations.

This capability lets Backend API create recording sessions, accept Observation IR events, persist them locally, and return events in deterministic session order.

## Requirements

- Validate ingested events against the shared Observation IR schema.
- Keep Observation IR factual and interpretation-free.
- Preserve event order using `sessionId`, `sequence`, `timestamp`, and `id`.
- Reject invalid events before persistence.
- Reject events whose body `sessionId` does not match the route `sessionId`.
- Store session and event indexes locally.
- Keep large payloads outside the event table and under `.bwc/artifacts/` conventions.
- Let Browser Worker post at least one smoke event to Backend API.

## API Surface

```text
POST /sessions
GET /sessions
GET /sessions/:sessionId
POST /sessions/:sessionId/events
GET /sessions/:sessionId/events
```

## Storage

Step 01 uses Node's built-in SQLite runtime:

```text
.bwc/
  bwc.sqlite
  artifacts/
```

SQLite stores recording session rows and observation event rows. Artifact payloads are not implemented yet, but the directory convention is created by the storage adapter.

## Boundaries

In scope:

- Recording session creation and lookup.
- Observation event validation and persistence.
- Event readback in sequence order.
- Browser Worker API smoke posting.
- Shared API client methods for session and event routes.

Out of scope:

- Real browser action capture.
- Fetch/XHR network capture.
- Evidence Graph generation.
- Workflow IR generation.
- Replay engine implementation.

## Verification

See [Step 01 Verification](../testing/2026-06-12-step-01-verification.md).

