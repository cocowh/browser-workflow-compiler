---
status: implemented
date: 2026-06-14
---

# Backend Analysis API Seed

## Goal

Expose the deterministic local analysis pipeline through Backend API for stored recording sessions.

This capability makes the package-level P0 analysis path reachable from the local runtime without introducing UI rendering, durable analysis snapshots, or live replay execution.

## Route

```text
POST /sessions/:sessionId/analyze
```

## Input

Route params:

- `sessionId`: stored recording session ID.

No request body is required for the seed route.

## Output

Successful responses return:

- `sessionId`: analyzed session ID.
- `actionRequestLinks`: deterministic action-request links from `@bwc/analysis`.
- `evidenceGraph`: Evidence Graph facts from `@bwc/analysis`.
- `workflow`: minimal Workflow IR from `@bwc/analysis`.

Missing sessions return the existing Backend API error response shape with `404`.

## P0 Rules

1. Fetch the session from Backend API storage.
2. Return `404` if the session does not exist.
3. Fetch stored Observation IR events for the session.
4. Run `linkActionRequests`.
5. Run `buildEvidenceGraph` with the generated links.
6. Run `generateMinimalWorkflow` with the graph and session ID.
7. Return analysis facts without persisting a snapshot.
8. Do not execute replay requests in this route.

## Acceptance Criteria

- A stored session can be analyzed through Backend API.
- The response includes action-request links, Evidence Graph facts, and minimal Workflow IR facts.
- Route tests cover success and missing-session behavior.
- Typecheck, lint, tests, build, and smoke verification pass.

## Non-scope

- Web Console rendering.
- API client helper methods.
- Persisting analysis artifacts as durable snapshots.
- Running live replay requests from Backend API.
- Browser-level replay.
- Export to Postman, OpenAPI, AsyncAPI, or code.
