---
sidebar_position: 2
status: draft
last_updated: 2026-06-12
---

# P0 Scope

## P0 Goal

Build the smallest local-first loop that proves the product direction:

```text
Record browser operation
-> capture browser and network events
-> store Observation IR
-> link actions to requests
-> generate Workflow IR
-> replay the workflow
```

## P0 In Scope

### Browser recording

- Launch a local Chromium browser.
- Record basic user actions:
  - click
  - input
  - navigation
  - wait
- Capture page URL and basic page context.
- Capture optional screenshot or DOM snippet references.

### Network capture

- Capture fetch and XHR requests.
- Capture HTTP method, URL, status, request headers, response headers, body references, and timing.
- Support JSON HTTP APIs.
- Detect basic GraphQL requests.
- Filter obvious static assets.

### Event storage

- Store a recording session.
- Store browser and network events in a common event model.
- Preserve enough raw evidence to allow later analysis.

### Timeline UI

- Show the recording session timeline.
- Show browser events and network events in order.
- Allow the user to inspect event details.

### Basic analysis

- Link browser actions to nearby network requests using a time-window based heuristic.
- Identify basic response-to-request field dependencies.
- Assign confidence scores to generated links.

### Workflow generation and replay

- Generate a minimal Workflow IR from selected network requests.
- Extract simple variables from previous responses.
- Replay the generated workflow at the API level.
- Show replay success, failure, or diff information.

## P0 Out of Scope

- Fully autonomous browser exploration agents.
- Captcha bypass.
- Anti-bot or risk-control evasion.
- Mobile app traffic capture.
- Complex protobuf reverse engineering.
- Full WebSocket workflow modeling.
- Full AsyncAPI export.
- Multi-tenant SaaS permission systems.
- Distributed browser execution infrastructure.
- Perfect workflow generation for arbitrary websites.

## Primary P0 Demo Scenario

The user records a simple authenticated web flow in Chromium, such as:

1. Open a page.
2. Click a button or submit a form.
3. Observe one or more API calls.
4. Inspect the action-request relationship.
5. Generate a minimal Workflow IR.
6. Replay the API-level workflow.

## P0 Success Criteria

- A local user can start a recording session.
- The system launches Chromium.
- Browser actions and network events are recorded.
- A timeline view shows the captured events.
- At least one user action is linked to at least one network request.
- A basic Workflow IR can be generated from selected requests.
- The generated workflow can be replayed locally.

## P0 Failure Signals

- The project becomes mostly a UI before the recording and replay loop works.
- The system generates attractive summaries that cannot be replayed.
- P0 depends on cloud infrastructure before the local loop is proven.
- P0 spends too much effort on edge cases like captcha, bot detection, mobile apps, or complex binary protocols.
