---
status: completed
date: 2026-06-13
---

# Step 03 - Network Request Capture

## Goal

Capture the first fetch/XHR network events from Browser Worker and persist them as Observation IR.

This step should extend the Step 02 browser lifecycle recorder with factual network request and response observations without starting Evidence Graph or Workflow IR generation.

## Source Documents

- [Project State](../../project/state.md)
- [P0 Scope](../product/p0-scope.md)
- [System Overview](../architecture/overview.md)
- [Observation IR](../domain/observation-ir.md)
- [Network Request Capture](../specs/2026-06-13-network-request-capture.md)
- [Step 02 - Browser Event Capture](./2026-06-12-step-02-browser-event-capture.md)

## Requirements

- Capture fetch/XHR request events.
- Capture matching response events.
- Preserve request IDs so requests and responses can be paired later.
- Store headers and bodies as artifact references when payloads are large or sensitive.
- Filter obvious static assets.
- Detect basic JSON and GraphQL request tags.
- Keep action-request linking out of this step.

## Tasks

- [x] Add Playwright network event capture in Browser Worker.
- [x] Create `network.request` Observation IR events.
- [x] Create `network.response` Observation IR events.
- [x] Add basic static asset filtering.
- [x] Add JSON and GraphQL tags.
- [x] Add artifact reference conventions for request and response bodies.
- [x] Add a local smoke page that performs one fetch request.
- [x] Verify Backend API stores browser and network events in sequence order.
- [x] Update module and testing docs.
- [x] Update [Project State](../../project/state.md) when complete.

## Acceptance Criteria

- [x] Browser Worker records at least one fetch/XHR request.
- [x] Backend API stores a matching request and response event.
- [x] Events include request ID, method, URL, status, tags, and timing information.
- [x] Typecheck, lint, tests, build, and smoke verification pass.

## Implementation Summary

Step 03 added:

- Playwright request/response listeners in Browser Worker.
- `network.request` and `network.response` Observation IR event construction.
- Stable Browser Worker-generated request IDs shared by matching request and response events.
- Basic filtering for static assets.
- `json`, `graphql`, and `sensitive` tag detection.
- Header/body artifact reference conventions for network observations.
- A default local smoke page that performs one JSON fetch to a Playwright-fulfilled route.
- Browser Worker tests for filtering, tag detection, and network event construction.

## Verification

See [Step 03 Verification](../testing/2026-06-13-step-03-verification.md).

## Non-scope

- Action-request linking.
- Evidence Graph persistence.
- Workflow IR generation.
- Replay engine implementation.
