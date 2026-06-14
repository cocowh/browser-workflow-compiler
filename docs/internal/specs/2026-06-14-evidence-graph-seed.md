---
status: implemented
date: 2026-06-14
---

# Evidence Graph Seed

## Goal

Create the first deterministic Evidence Graph output from Observation IR events and action-request links.

This seed graph exists so later UI and Workflow IR generation can inspect why an action, request, and response are believed to be related. It does not persist graph data and does not generate workflows.

## Input

`buildEvidenceGraph` accepts:

- `ObservationEvent[]` from one or more recording sessions.
- Optional precomputed `ActionRequestLink[]`.

When no links are supplied, `buildEvidenceGraph` runs the Step 05 `linkActionRequests` heuristic internally.

Relevant event types:

- `browser.click`
- `browser.input`
- `network.request`
- `network.response`

Other Observation IR events are ignored by the seed graph builder.

## Output Shape

```ts
type EvidenceGraph = {
  nodes: EvidenceGraphNode[];
  edges: EvidenceGraphEdge[];
};

type EvidenceGraphNode = {
  id: string;
  type: "action" | "request" | "response";
  sessionId: string;
  sourceEventId: string;
  sourceEventType: ObservationEvent["type"];
  label: string;
  timestamp: number;
  sequence: number;
  pageUrl?: string;
  metadata: Record<string, unknown>;
};

type EvidenceGraphEdge = {
  id: string;
  type: "triggered";
  sessionId: string;
  fromNodeId: string;
  toNodeId: string;
  sourceLinkId: string;
  sourceEventIds: string[];
  confidence: number;
  reason: "nearest_request_after_action";
  metadata: {
    actionId: string;
    requestId: string;
    responseEventId?: string;
    timeDeltaMs: number;
  };
};
```

## P0 Seed Rules

Nodes:

1. Convert `browser.click` and `browser.input` events into `action` nodes.
2. Convert `network.request` events into `request` nodes.
3. Convert `network.response` events into `response` nodes.
4. Preserve source event ID, event type, session ID, timestamp, sequence, page URL, and selected safe metadata.

Edges:

1. Convert each valid `ActionRequestLink` into one `triggered` edge.
2. Connect the action node to the request node.
3. Preserve the link ID as `sourceLinkId`.
4. Preserve action ID, request ID, confidence, reason, time delta, response event ID, and source event IDs.
5. Drop edges when their source action or target request node is absent.

Ordering:

- Sort events by sequence, timestamp, and ID.
- Sort supplied links deterministically before edge generation.
- Generate stable IDs from source event IDs and link IDs.

## Acceptance Criteria

- A Step 04 style event stream can produce action, request, and response nodes.
- A Step 04 style event stream can produce at least one `triggered` edge through Step 05 links.
- Graph edges preserve action-request link metadata.
- Response matching remains scoped by recording session.
- Typecheck, lint, tests, build, and smoke verification pass.

## Non-scope

- Workflow IR generation.
- Replay engine implementation.
- Graph persistence.
- Interactive graph visualization.
- Field dependency extraction.
- Human review state.
