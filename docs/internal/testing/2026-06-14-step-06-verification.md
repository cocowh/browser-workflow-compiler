# Step 06 Verification

## Environment

- Date: 2026-06-14
- Runtime target: Node 24 LTS
- Local runtime used for verification: Node.js `v26.0.0`
- Package manager: `npx pnpm@11.5.3`

## Commands Run

```bash
npx pnpm@11.5.3 --filter @bwc/analysis typecheck
npx pnpm@11.5.3 --filter @bwc/analysis test
npx pnpm@11.5.3 check
npx pnpm@11.5.3 smoke:browser
```

## Expected Runtime Evidence

The graph fixture should produce a triggered edge like:

```json
{
  "type": "triggered",
  "fromNodeId": "node_action_evt_click",
  "toNodeId": "node_request_evt_request",
  "sourceLinkId": "link_evt_click_evt_request",
  "confidence": 0.9,
  "reason": "nearest_request_after_action",
  "metadata": {
    "actionId": "act_click",
    "requestId": "req_smoke",
    "responseEventId": "evt_response",
    "timeDeltaMs": 120
  }
}
```

## Results

- `@bwc/analysis` builds action, request, and response nodes from Step 04 style Observation IR events.
- `@bwc/analysis` builds `triggered` edges from Step 05 action-request links.
- Graph edges preserve link ID, action ID, request ID, response event ID, confidence, reason, and time delta.
- Response matching remains scoped by recording session.
- Typecheck, lint, tests, and build passed.
- Browser Worker smoke still emits the action, network, and lifecycle event stream needed by the analysis fixtures.
