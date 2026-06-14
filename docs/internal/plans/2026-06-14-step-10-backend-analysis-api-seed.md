---
status: planned
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
- [Step 09 - Replay Result Evidence](./2026-06-14-step-09-replay-result-evidence.md)

## Requirements

- Add a minimal Backend API route that can run deterministic analysis for a stored session.
- Reuse `@bwc/analysis` rather than duplicating linking, graph, workflow, or replay evidence logic.
- Return action-request links, Evidence Graph, and minimal Workflow IR facts in a local-only response shape.
- Keep API-level replay execution optional until request reconstruction and user confirmation rules are clearer.
- Keep Web Console integration out unless needed for a minimal smoke fixture.

## Tasks

- [ ] Write a Backend Analysis API capability spec.
- [ ] Add request and response schemas for a local session analysis route.
- [ ] Implement the route using existing Backend API storage and `@bwc/analysis`.
- [ ] Add Backend API tests with stored session fixtures.
- [ ] Update module and testing docs.
- [ ] Update [Project State](../../project/state.md) when complete.

## Acceptance Criteria

- A stored session can be analyzed through Backend API.
- The response includes action-request links, Evidence Graph facts, and minimal Workflow IR facts.
- Route tests cover success and missing-session behavior.
- Typecheck, lint, tests, build, and smoke verification pass.

## Non-scope

- Web Console rendering.
- Persisting analysis artifacts as durable snapshots.
- Running live replay requests from Backend API.
- Browser-level replay.
- Export to Postman, OpenAPI, AsyncAPI, or code.
