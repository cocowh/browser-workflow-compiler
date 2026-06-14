---
status: completed
date: 2026-06-14
---

# Step 06 - Evidence Graph Seed

## Goal

Create the first minimal Evidence Graph representation from Observation IR events and action-request links.

This step should build a deterministic graph model for inspection and later UI integration. It should not generate Workflow IR or replay workflows.

## Source Documents

- [Project State](../../project/state.md)
- [P0 Scope](../product/p0-scope.md)
- [Evidence Graph](../domain/evidence-graph.md)
- [Observation IR](../domain/observation-ir.md)
- [Evidence Graph Seed](../specs/2026-06-14-evidence-graph-seed.md)
- [Action Request Linking](../specs/2026-06-14-action-request-linking.md)
- [Step 05 - Action Request Linking](./2026-06-14-step-05-action-request-linking.md)

## Requirements

- Convert action events into graph nodes.
- Convert network request/response events into graph nodes.
- Convert action-request links into graph edges.
- Preserve source Observation IR event IDs.
- Preserve action-request link confidence, reason, time delta, action ID, request ID, and response event ID.
- Keep graph generation deterministic for ordered or unordered input events.
- Keep Workflow IR generation out of this step.

## Tasks

- [x] Define minimal Evidence Graph node and edge shape.
- [x] Add deterministic graph builder function.
- [x] Add tests using Step 05 action-request link fixtures.
- [x] Add an Evidence Graph Seed capability spec.
- [x] Update module and testing docs.
- [x] Update [Project State](../../project/state.md) when complete.

## Acceptance Criteria

- [x] A Step 04 style event stream can produce graph nodes and edges.
- [x] Graph edges preserve action-request link metadata.
- [x] Typecheck, lint, tests, build, and smoke verification pass.

## Implementation Summary

Step 06 added:

- `buildEvidenceGraph` in `@bwc/analysis`.
- `EvidenceGraph`, `EvidenceGraphNode`, and `EvidenceGraphEdge` output shapes.
- Stable node and edge ID helpers.
- Action, request, and response graph nodes derived from Observation IR events.
- `triggered` graph edges derived from Step 05 action-request links.
- Tests for Step 04 style graph generation, supplied link metadata preservation, and session-scoped response matching.

## Verification

See [Step 06 Verification](../testing/2026-06-14-step-06-verification.md).

## Non-scope

- Workflow IR generation.
- Replay engine implementation.
- Graph persistence.
- Interactive UI visualization.
