---
status: completed
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
- [API-Level Replay Seed](../specs/2026-06-14-api-level-replay-seed.md)
- [Step 07 - Minimal Workflow IR Generation](./2026-06-14-step-07-minimal-workflow-ir-generation.md)

## Requirements

- Execute minimal Workflow IR `http.request` steps locally.
- Preserve replay result status, timing, and error facts.
- Link replay results back to workflow step IDs and evidence refs.
- Keep browser-level replay out of this step.
- Keep variable extraction and dependency inference out unless needed for a minimal fixture.

## Tasks

- [x] Write an API-level replay seed capability spec.
- [x] Add a deterministic local replay runner boundary.
- [x] Add tests for successful and failed HTTP request steps.
- [x] Update module and testing docs.
- [x] Update [Project State](../../project/state.md) when complete.

## Acceptance Criteria

- [x] A minimal Workflow IR with one HTTP request step can be replayed locally.
- [x] Replay result facts preserve workflow step ID, status or error, and evidence refs.
- [x] Typecheck, lint, tests, build, and smoke verification pass.

## Implementation Summary

Step 08 added:

- `@bwc/replay` as the first API-level replay package.
- `replayWorkflow` for ordered execution of minimal `http.request` Workflow IR steps.
- Injected HTTP client and clock boundaries for deterministic tests.
- Replay result facts with workflow ID, step ID, status, timing, response facts, error facts, and evidence refs.
- Tests for successful replay, failed response status, and thrown HTTP client errors.

## Verification

See [Step 08 Verification](../testing/2026-06-14-step-08-verification.md).

## Non-scope

- Browser-level replay.
- Variable extraction and dependency inference.
- Complex assertions.
- Retries and backoff.
- Export to Postman, OpenAPI, AsyncAPI, or code.
