---
status: completed
date: 2026-06-14
---

# Step 09 - Replay Result Evidence

## Goal

Convert API-level replay facts into Evidence Graph `replay_result` nodes and `verified_by` edges.

This step should close the explainability loop for replay: a user should be able to trace from a generated Workflow IR step to the replay result that verified or failed it.

## Source Documents

- [Project State](../../project/state.md)
- [P0 Scope](../product/p0-scope.md)
- [Workflow IR](../domain/workflow-ir.md)
- [Evidence Graph](../domain/evidence-graph.md)
- [API-Level Replay Seed](../specs/2026-06-14-api-level-replay-seed.md)
- [Replay Result Evidence](../specs/2026-06-14-replay-result-evidence.md)
- [Step 08 - API-Level Replay Seed](./2026-06-14-step-08-api-level-replay-seed.md)

## Requirements

- Add a deterministic conversion from `ReplayResult` facts to Evidence Graph additions.
- Add `replay_result` graph nodes for replayed workflow steps.
- Add `verified_by` graph edges from workflow step evidence to replay result evidence.
- Preserve replay status, timing, response status, error facts, workflow ID, and step ID in metadata.
- Keep UI rendering and persistence out unless needed for a minimal fixture.

## Tasks

- [x] Write or update the replay result evidence capability spec.
- [x] Extend the Evidence Graph model used by analysis to represent replay result nodes and `verified_by` edges.
- [x] Add tests for passed and failed replay results.
- [x] Update module and testing docs.
- [x] Update [Project State](../../project/state.md) when complete.

## Acceptance Criteria

- [x] A replay result can produce deterministic Evidence Graph additions.
- [x] Each replay result node preserves workflow step ID, status or error, timing, and evidence refs.
- [x] Each `verified_by` edge links the generated workflow step evidence to the replay result evidence.
- [x] Typecheck, lint, tests, build, and smoke verification pass.

## Implementation Summary

Step 09 added:

- `addReplayResultEvidence` in `@bwc/analysis`.
- Evidence Graph `workflow_step` and `replay_result` node support.
- Evidence Graph `verified_by` edge support.
- Deterministic node and edge ID helpers for replay result evidence.
- Tests for passed replay result evidence and failed replay error evidence.

## Verification

See [Step 09 Verification](../testing/2026-06-14-step-09-verification.md).

## Non-scope

- Browser-level replay.
- Persisting Evidence Graph snapshots.
- Web Console replay visualization.
- Variable extraction and dependency inference.
- Export to Postman, OpenAPI, AsyncAPI, or code.
