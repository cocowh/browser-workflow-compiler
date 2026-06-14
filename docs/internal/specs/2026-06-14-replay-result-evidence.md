---
status: implemented
date: 2026-06-14
---

# Replay Result Evidence

## Goal

Convert API-level replay facts into deterministic Evidence Graph additions.

This capability closes the explainability loop for API-level replay. After a Workflow IR step is replayed, the system can represent the generated workflow step, the replay result, and the verification relationship as graph evidence.

## Input

`addReplayResultEvidence` accepts:

- An existing `EvidenceGraph`.
- The `Workflow` that was replayed.
- The `ReplayResult` returned by `@bwc/replay`.

The replay result workflow ID must match the Workflow IR ID. Mismatched inputs are rejected instead of generating misleading evidence.

## Output

The function returns a new `EvidenceGraph` with deterministic additions:

- `workflow_step` nodes for replayed Workflow IR steps.
- `replay_result` nodes for replay step results.
- `verified_by` edges from each `workflow_step` node to its matching `replay_result` node.

Existing graph nodes and edges are preserved. Additions are deterministic and duplicate-safe by ID.

## P0 Conversion Rules

1. Sort replay step results by Workflow IR step order, then by step ID and replay step result ID.
2. Skip replay step results that do not match a Workflow IR step.
3. Create a `workflow_step` node for each matched Workflow IR step when one does not already exist.
4. Create a `replay_result` node for each matched replay step result when one does not already exist.
5. Create a `verified_by` edge from the workflow step node to the replay result node.
6. Preserve workflow ID, workflow step ID, replay ID, replay step result ID, replay status, timing, request facts, response status facts, error facts, and evidence refs.
7. Keep runtime execution, persistence, and UI rendering out of this step.

## Acceptance Criteria

- A replay result can produce deterministic Evidence Graph additions.
- Each replay result node preserves workflow step ID, status or error, timing, and evidence refs.
- Each `verified_by` edge links the generated workflow step evidence to the replay result evidence.
- Passed and failed replay result fixtures are covered by tests.
- Typecheck, lint, tests, build, and smoke verification pass.

## Non-scope

- Running the replay engine.
- Browser-level replay.
- Persisting Evidence Graph snapshots.
- Web Console replay visualization.
- Backend API exposure.
- Variable extraction and dependency inference.
- Export to Postman, OpenAPI, AsyncAPI, or code.
