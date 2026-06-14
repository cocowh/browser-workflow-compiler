---
status: active
date: 2026-06-14
---

# Step 08 - API-Level Replay Seed

## Goal

Create the first local replay path for minimal Workflow IR `http.request` steps.

This step should prove the final P0 loop segment: a generated Workflow IR can be executed locally and produce replay result evidence. It should keep advanced assertions, variables, retries, and export formats out of scope.

## Source Documents

- [Project State](../../project/state.md)
- [P0 Scope](../product/p0-scope.md)
- [Workflow IR](../domain/workflow-ir.md)
- [Evidence Graph](../domain/evidence-graph.md)
- [Minimal Workflow IR Generation](../specs/2026-06-14-minimal-workflow-ir-generation.md)
- [Step 07 - Minimal Workflow IR Generation](./2026-06-14-step-07-minimal-workflow-ir-generation.md)

## Requirements

- Execute minimal Workflow IR `http.request` steps locally.
- Preserve replay result status, timing, and error facts.
- Link replay results back to workflow step IDs and evidence refs.
- Keep browser-level replay out of this step.
- Keep variable extraction and dependency inference out unless needed for a minimal fixture.

## Tasks

- [ ] Write an API-level replay seed capability spec.
- [ ] Add a deterministic local replay runner boundary.
- [ ] Add tests for successful and failed HTTP request steps.
- [ ] Update module and testing docs.
- [ ] Update [Project State](../../project/state.md) when complete.

## Acceptance Criteria

- [ ] A minimal Workflow IR with one HTTP request step can be replayed locally.
- [ ] Replay result facts preserve workflow step ID, status or error, and evidence refs.
- [ ] Typecheck, lint, tests, build, and smoke verification pass.

## Non-scope

- Browser-level replay.
- Variable extraction and dependency inference.
- Complex assertions.
- Retries and backoff.
- Export to Postman, OpenAPI, AsyncAPI, or code.
