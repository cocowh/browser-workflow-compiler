---
status: completed
date: 2026-06-14
---

# Step 10 - Backend Analysis API Seed

## Goal

Expose the deterministic local analysis pipeline through Backend API routes.

This step should make the package-level P0 analysis capabilities reachable from the local product runtime without adding UI rendering or persistence-heavy artifact management yet.

## Source Documents

- [Project State](../../project/state.md)
- [P0 Scope](../product/p0-scope.md)
- [System Overview](../architecture/overview.md)
- [Observation IR](../domain/observation-ir.md)
- [Evidence Graph](../domain/evidence-graph.md)
- [Workflow IR](../domain/workflow-ir.md)
- [Replay Result Evidence](../specs/2026-06-14-replay-result-evidence.md)
- [Backend Analysis API Seed](../specs/2026-06-14-backend-analysis-api-seed.md)
- [Step 09 - Replay Result Evidence](./2026-06-14-step-09-replay-result-evidence.md)

## Requirements

- Add a minimal Backend API route that can run deterministic analysis for a stored session.
- Reuse `@bwc/analysis` rather than duplicating linking, graph, workflow, or replay evidence logic.
- Return action-request links, Evidence Graph, and minimal Workflow IR facts in a local-only response shape.
- Keep API-level replay execution optional until request reconstruction and user confirmation rules are clearer.
- Keep Web Console integration out unless needed for a minimal smoke fixture.

## Tasks

- [x] Write a Backend Analysis API capability spec.
- [x] Add request and response schemas for a local session analysis route.
- [x] Implement the route using existing Backend API storage and `@bwc/analysis`.
- [x] Add Backend API tests with stored session fixtures.
- [x] Update module and testing docs.
- [x] Update [Project State](../../project/state.md) when complete.

## Acceptance Criteria

- [x] A stored session can be analyzed through Backend API.
- [x] The response includes action-request links, Evidence Graph facts, and minimal Workflow IR facts.
- [x] Route tests cover success and missing-session behavior.
- [x] Typecheck, lint, tests, build, and smoke verification pass.

## Implementation Summary

Step 10 added:

- `POST /sessions/:sessionId/analyze`.
- Backend API analysis response schema.
- Route implementation backed by existing session event storage.
- Reuse of `@bwc/analysis` for action-request linking, Evidence Graph generation, and minimal Workflow IR generation.
- Tests for successful stored-session analysis and missing-session `404`.

## Verification

See [Step 10 Verification](../testing/2026-06-14-step-10-verification.md).

## Non-scope

- Web Console rendering.
- Persisting analysis artifacts as durable snapshots.
- Running live replay requests from Backend API.
- Browser-level replay.
- Export to Postman, OpenAPI, AsyncAPI, or code.
