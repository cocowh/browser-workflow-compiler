---
status: implemented
date: 2026-06-14
---

# Action Request Linking

## Goal

Link browser action observations to nearby network request observations using a simple factual heuristic.

This capability creates the first analysis output from Observation IR. It does not persist Evidence Graph data and does not generate Workflow IR.

## Input

`linkActionRequests` accepts ordered or unordered `ObservationEvent[]` for one or more sessions.

Relevant event types:

- `browser.click`
- `browser.input`
- `network.request`
- `network.response`

## Output Shape

```ts
type ActionRequestLink = {
  id: string;
  sessionId: string;
  actionEventId: string;
  actionId: string;
  requestEventId: string;
  requestId: string;
  responseEventId?: string;
  confidence: number;
  reason: "nearest_request_after_action";
  timeDeltaMs: number;
};
```

## P0 Heuristic

For each `network.request` event:

1. Find candidate `browser.click` and `browser.input` events from the same session.
2. Keep only actions that occurred before the request.
3. Keep only actions within the configured window, defaulting to `1500ms`.
4. Choose the nearest preceding action by timestamp.
5. Attach the matching `network.response` when a response with the same `requestId` exists.

Confidence:

- `0.9`: request happened within `0-500ms` after the action.
- `0.7`: request happened within `501-1500ms` after the action.

## Acceptance Criteria

- At least one click or input event links to a nearby network request.
- The link includes action ID, request ID, confidence, reason, and time delta.
- Matching response events are preserved through shared request IDs.
- Typecheck, lint, tests, build, and smoke verification pass.

## Non-scope

- Persistent Evidence Graph storage.
- Workflow IR generation.
- Replay engine implementation.
- Complex causal inference across multiple concurrent requests.
