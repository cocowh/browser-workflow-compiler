---
status: active
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
- [Action Request Linking](../specs/2026-06-14-action-request-linking.md)
- [Step 05 - Action Request Linking](./2026-06-14-step-05-action-request-linking.md)

## Requirements

- Convert action events into graph nodes.
- Convert network request/response events into graph nodes.
- Convert action-request links into graph edges.
- Preserve source Observation IR event IDs.
- Keep Workflow IR generation out of this step.

## Tasks

- [ ] Define minimal Evidence Graph node and edge shape.
- [ ] Add deterministic graph builder function.
- [ ] Add tests using Step 05 action-request link fixtures.
- [ ] Update module and testing docs.
- [ ] Update [Project State](../../project/state.md) when complete.

## Acceptance Criteria

- [ ] A Step 04 style event stream can produce graph nodes and edges.
- [ ] Graph edges preserve action-request link metadata.
- [ ] Typecheck, lint, tests, build, and smoke verification pass.

## Non-scope

- Workflow IR generation.
- Replay engine implementation.
- Graph persistence.
- Interactive UI visualization.
