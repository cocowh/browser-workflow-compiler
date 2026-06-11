---
status: active
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

- [ ] Add a Browser Worker recorder module.
- [ ] Add event sequencing helper.
- [ ] Add CLI arguments for target URL and Backend API URL.
- [ ] Capture `browser.session_started`.
- [ ] Capture `browser.navigate`.
- [ ] Capture `browser.session_stopped`.
- [ ] Post events through `@bwc/api-client`.
- [ ] Add Browser Worker tests or smoke verification.
- [ ] Update Web Console to read session/events from Backend API if low-risk.
- [ ] Update module and testing docs.
- [ ] Update [Project State](../../project/state.md) when complete.

## Acceptance Criteria

- [ ] Browser Worker can record a navigation to a local or data URL.
- [ ] Backend API stores at least three browser events for the session.
- [ ] Events read back in sequence order.
- [ ] Typecheck, lint, tests, build, and smoke verification pass.

## Non-scope

- Real click/input instrumentation.
- Fetch/XHR network capture.
- Action-request linking.
- Evidence Graph generation.
- Workflow IR generation.
