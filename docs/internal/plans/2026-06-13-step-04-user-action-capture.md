---
status: completed
date: 2026-06-14
---

# Step 04 - User Action Capture

## Goal

Capture basic user action events from Browser Worker so later steps can link actions to nearby network requests.

This step should add factual click/input/wait observations without starting Evidence Graph generation.

## Source Documents

- [Project State](../../project/state.md)
- [P0 Scope](../product/p0-scope.md)
- [Observation IR](../domain/observation-ir.md)
- [User Action Capture](../specs/2026-06-14-user-action-capture.md)
- [Network Request Capture](../specs/2026-06-13-network-request-capture.md)
- [Step 03 - Network Request Capture](./2026-06-12-step-03-network-request-capture.md)

## Requirements

- Capture basic click events.
- Capture basic input/change events.
- Preserve page URL, selector-like target hints, visible text/value metadata when safe.
- Preserve monotonic `sequence` values alongside browser and network events.
- Keep action-request linking out of this step.

## Tasks

- [x] Add browser-side event instrumentation for click and input.
- [x] Create `browser.click` Observation IR events.
- [x] Create `browser.input` Observation IR events.
- [x] Add a local smoke page that triggers one action and one fetch.
- [x] Verify events are stored in sequence order with nearby network events.
- [x] Update module and testing docs.
- [x] Update [Project State](../../project/state.md) when complete.

## Acceptance Criteria

- [x] Browser Worker records at least one click or input event.
- [x] Backend API stores browser action and network events in one session.
- [x] Events preserve monotonic sequence values.
- [x] Typecheck, lint, tests, build, and smoke verification pass.

## Implementation Summary

Step 04 added:

- Browser-side click/input instrumentation installed through Browser Worker.
- `browser.click` and `browser.input` Observation IR event construction.
- Target hints based on `data-testid`, `id`, `name`, `aria-label`, and tag fallback.
- Basic sensitive-field handling for password and hidden inputs.
- A default smoke page that fills an input, clicks a button, and triggers a fetch.
- Browser Worker tests for action event construction and sensitive input normalization.

## Verification

See [Step 04 Verification](../testing/2026-06-14-step-04-verification.md).

## Non-scope

- Action-request linking.
- Evidence Graph persistence.
- Workflow IR generation.
- Replay engine implementation.
