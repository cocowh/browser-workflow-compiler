---
status: active
date: 2026-06-14
---

# Step 05 - Action Request Linking

## Goal

Link browser action events to nearby network request/response events using a simple factual heuristic.

This step should create the first analysis output needed by Evidence Graph and Workflow IR generation, while keeping replay and workflow generation out of scope.

## Source Documents

- [Project State](../../project/state.md)
- [P0 Scope](../product/p0-scope.md)
- [Observation IR](../domain/observation-ir.md)
- [Evidence Graph](../domain/evidence-graph.md)
- [User Action Capture](../specs/2026-06-14-user-action-capture.md)
- [Network Request Capture](../specs/2026-06-13-network-request-capture.md)
- [Step 04 - User Action Capture](./2026-06-13-step-04-user-action-capture.md)

## Requirements

- Read ordered Observation IR events for one recording session.
- Link `browser.click` and `browser.input` events to nearby `network.request` events.
- Preserve matching `network.response` events through shared `requestId`.
- Assign a confidence score and reason.
- Keep generated Workflow IR out of this step.

## Tasks

- [ ] Add a minimal analysis module for action-request linking.
- [ ] Define the first link output shape.
- [ ] Add tests for time-window based linking.
- [ ] Add a local smoke or fixture using Step 04 events.
- [ ] Update module and testing docs.
- [ ] Update [Project State](../../project/state.md) when complete.

## Acceptance Criteria

- [ ] At least one click or input event links to a nearby network request.
- [ ] The link includes action ID, request ID, confidence, and reason.
- [ ] Typecheck, lint, tests, build, and smoke verification pass.

## Non-scope

- Workflow IR generation.
- Replay engine implementation.
- Complex causal inference.
- Persistent Evidence Graph storage.
