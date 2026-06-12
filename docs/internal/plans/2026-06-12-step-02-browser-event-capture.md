---
status: completed
date: 2026-06-12
---

# Step 02 - Browser Event Capture

## Goal

Turn Browser Worker from a smoke launcher into a recorder for basic browser events.

This step should capture a small factual browser event stream and post it through the Step 01 Observation IR ingestion path.

## Source Documents

- [Project State](../../project/state.md)
- [P0 Scope](../product/p0-scope.md)
- [System Overview](../architecture/overview.md)
- [Observation IR](../domain/observation-ir.md)
- [Observation IR Ingestion](../specs/2026-06-12-observation-ir-ingestion.md)
- [Step 01 - Observation IR Ingestion](./2026-06-12-step-01-observation-ir.md)

## Requirements

- Launch Chromium through Browser Worker.
- Create a recording session through Backend API.
- Record basic browser lifecycle events:
  - `browser.session_started`
  - `browser.navigate`
  - `browser.session_stopped`
- Preserve event order with monotonic `sequence` values.
- Send captured events to Backend API through `@bwc/api-client`.
- Keep network capture out of this step unless it is needed for a minimal smoke page.

## Tasks

- [x] Add a Browser Worker recorder module.
- [x] Add event sequencing helper.
- [x] Add CLI arguments for target URL and Backend API URL.
- [x] Capture `browser.session_started`.
- [x] Capture `browser.navigate`.
- [x] Capture `browser.session_stopped`.
- [x] Post events through `@bwc/api-client`.
- [x] Add Browser Worker tests or smoke verification.
- [x] Update Web Console to read session/events from Backend API if low-risk.
- [x] Update module and testing docs.
- [x] Update [Project State](../../project/state.md) when complete.

## Acceptance Criteria

- [x] Browser Worker can record a navigation to a local or data URL.
- [x] Backend API stores at least three browser events for the session.
- [x] Events read back in sequence order.
- [x] Typecheck, lint, tests, build, and smoke verification pass.

## Implementation Summary

Step 02 added:

- Browser Worker recorder module under `apps/browser-worker/src/recorder/`.
- `EventSequencer` for monotonic session event ordering.
- CLI parsing for `--api`, `--url`, `--session-name`, and `--headed`.
- Lifecycle event capture for `browser.session_started`, `browser.navigate`, and `browser.session_stopped`.
- Browser Worker unit tests for sequencing and event construction.
- Browser Worker smoke output that includes the captured event stream and readback count.

The Web Console remains on static demo data. API-backed Web Console data loading is deferred because Step 02's core acceptance criteria are satisfied through Browser Worker and Backend API integration smoke.

## Verification

See [Step 02 Verification](../testing/2026-06-12-step-02-verification.md).

## Non-scope

- Real click/input instrumentation.
- Fetch/XHR network capture.
- Action-request linking.
- Evidence Graph generation.
- Workflow IR generation.
