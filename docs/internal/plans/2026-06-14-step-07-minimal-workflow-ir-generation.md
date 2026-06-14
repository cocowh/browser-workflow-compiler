---
status: active
date: 2026-06-14
---

# Step 07 - Minimal Workflow IR Generation

## Goal

Generate the first minimal Workflow IR from selected network requests and Evidence Graph edges.

This step should prove the next product link in the P0 route: recorded observations and evidence can become an editable API-level workflow. It should not implement replay yet.

## Source Documents

- [Project State](../../project/state.md)
- [P0 Scope](../product/p0-scope.md)
- [Workflow IR](../domain/workflow-ir.md)
- [Evidence Graph](../domain/evidence-graph.md)
- [Observation IR](../domain/observation-ir.md)
- [Evidence Graph Seed](../specs/2026-06-14-evidence-graph-seed.md)
- [Step 06 - Evidence Graph Seed](./2026-06-14-step-06-evidence-graph-seed.md)

## Requirements

- Generate a `Workflow` object from network request observations.
- Create one `http.request` step for each selected request.
- Preserve evidence references from Evidence Graph triggered edges.
- Preserve method and URL from request events.
- Keep response field extraction, replay execution, and export formats out of this step unless needed for a minimal fixture.

## Tasks

- [ ] Write or update a Workflow IR generation capability spec.
- [ ] Add a deterministic minimal workflow generator.
- [ ] Add tests using Step 06 graph fixtures.
- [ ] Update module and testing docs.
- [ ] Update [Project State](../../project/state.md) when complete.

## Acceptance Criteria

- [ ] A Step 04 style event stream plus Step 06 graph can produce a minimal Workflow IR.
- [ ] Generated HTTP steps preserve method, URL, and evidence references.
- [ ] Typecheck, lint, tests, build, and smoke verification pass.

## Non-scope

- Replay engine implementation.
- Variable extraction and dependency inference.
- Browser-level workflow replay.
- Export to Postman, OpenAPI, AsyncAPI, or code.
