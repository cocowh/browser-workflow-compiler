---
status: active
date: 2026-06-12
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

- [ ] Add Playwright network event capture in Browser Worker.
- [ ] Create `network.request` Observation IR events.
- [ ] Create `network.response` Observation IR events.
- [ ] Add basic static asset filtering.
- [ ] Add JSON and GraphQL tags.
- [ ] Add artifact reference conventions for request and response bodies.
- [ ] Add a local smoke page that performs one fetch request.
- [ ] Verify Backend API stores browser and network events in sequence order.
- [ ] Update module and testing docs.
- [ ] Update [Project State](../../project/state.md) when complete.

## Acceptance Criteria

- [ ] Browser Worker records at least one fetch/XHR request.
- [ ] Backend API stores a matching request and response event.
- [ ] Events include request ID, method, URL, status, tags, and timing information.
- [ ] Typecheck, lint, tests, build, and smoke verification pass.

## Non-scope

- Action-request linking.
- Evidence Graph persistence.
- Workflow IR generation.
- Replay engine implementation.
