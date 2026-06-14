---
status: active
date: 2026-06-13
---

# Step 04 - User Action Capture

## Goal

Capture basic user action events from Browser Worker so later steps can link actions to nearby network requests.

This step should add factual click/input/wait observations without starting Evidence Graph generation.

## Source Documents

- [Project State](../../project/state.md)
- [P0 Scope](../product/p0-scope.md)
- [Observation IR](../domain/observation-ir.md)
- [Network Request Capture](../specs/2026-06-13-network-request-capture.md)
- [Step 03 - Network Request Capture](./2026-06-12-step-03-network-request-capture.md)

## Requirements

- Capture basic click events.
- Capture basic input/change events.
- Preserve page URL, selector-like target hints, visible text/value metadata when safe.
- Preserve monotonic `sequence` values alongside browser and network events.
- Keep action-request linking out of this step.

## Tasks

- [ ] Add browser-side event instrumentation for click and input.
- [ ] Create `browser.click` Observation IR events.
- [ ] Create `browser.input` Observation IR events.
- [ ] Add a local smoke page that triggers one action and one fetch.
- [ ] Verify events are stored in sequence order with nearby network events.
- [ ] Update module and testing docs.
- [ ] Update [Project State](../../project/state.md) when complete.

## Acceptance Criteria

- [ ] Browser Worker records at least one click or input event.
- [ ] Backend API stores browser action and network events in one session.
- [ ] Events preserve monotonic sequence values.
- [ ] Typecheck, lint, tests, build, and smoke verification pass.

## Non-scope

- Action-request linking.
- Evidence Graph persistence.
- Workflow IR generation.
- Replay engine implementation.
