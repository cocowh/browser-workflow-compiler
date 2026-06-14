---
status: completed
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
- [Minimal Workflow IR Generation](../specs/2026-06-14-minimal-workflow-ir-generation.md)
- [Step 06 - Evidence Graph Seed](./2026-06-14-step-06-evidence-graph-seed.md)

## Requirements

- Generate a `Workflow` object from network request observations.
- Create one `http.request` step for each selected request.
- Preserve evidence references from Evidence Graph triggered edges.
- Preserve method and URL from request events.
- Support deterministic selected-request filtering.
- Skip invalid request observations that cannot produce valid `http.request` steps.
- Keep response field extraction, replay execution, and export formats out of this step unless needed for a minimal fixture.

## Tasks

- [x] Write or update a Workflow IR generation capability spec.
- [x] Add a deterministic minimal workflow generator.
- [x] Add tests using Step 06 graph fixtures.
- [x] Update module and testing docs.
- [x] Update [Project State](../../project/state.md) when complete.

## Acceptance Criteria

- [x] A Step 04 style event stream plus Step 06 graph can produce a minimal Workflow IR.
- [x] Generated HTTP steps preserve method, URL, and evidence references.
- [x] Typecheck, lint, tests, build, and smoke verification pass.

## Implementation Summary

Step 07 added:

- `generateMinimalWorkflow` in `@bwc/analysis`.
- Stable workflow and workflow step ID helpers.
- Minimal `http.request` step generation from `network.request` observations.
- Evidence Graph edge references as `evidence://...` workflow and step refs.
- Selected request filtering.
- Tests for graph-backed workflow generation, selected request filtering, and invalid request skipping.

## Verification

See [Step 07 Verification](../testing/2026-06-14-step-07-verification.md).

## Non-scope

- Replay engine implementation.
- Variable extraction and dependency inference.
- Browser-level workflow replay.
- Export to Postman, OpenAPI, AsyncAPI, or code.
