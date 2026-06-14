---
status: planned
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
- [Step 08 - API-Level Replay Seed](./2026-06-14-step-08-api-level-replay-seed.md)

## Requirements

- Add a deterministic conversion from `ReplayResult` facts to Evidence Graph additions.
- Add `replay_result` graph nodes for replayed workflow steps.
- Add `verified_by` graph edges from workflow step evidence to replay result evidence.
- Preserve replay status, timing, response status, error facts, workflow ID, and step ID in metadata.
- Keep UI rendering and persistence out unless needed for a minimal fixture.

## Tasks

- [ ] Write or update the replay result evidence capability spec.
- [ ] Extend the Evidence Graph model used by analysis to represent replay result nodes and `verified_by` edges.
- [ ] Add tests for passed and failed replay results.
- [ ] Update module and testing docs.
- [ ] Update [Project State](../../project/state.md) when complete.

## Acceptance Criteria

- A replay result can produce deterministic Evidence Graph additions.
- Each replay result node preserves workflow step ID, status or error, timing, and evidence refs.
- Each `verified_by` edge links the generated workflow step evidence to the replay result evidence.
- Typecheck, lint, tests, build, and smoke verification pass.

## Non-scope

- Browser-level replay.
- Persisting Evidence Graph snapshots.
- Web Console replay visualization.
- Variable extraction and dependency inference.
- Export to Postman, OpenAPI, AsyncAPI, or code.
