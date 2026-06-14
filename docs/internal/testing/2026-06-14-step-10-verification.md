# Step 10 Verification

## Environment

- Date: 2026-06-14
- Runtime target: Node 24 LTS
- Local runtime used for verification: Node.js `v26.0.0`
- Package manager: `npx pnpm@11.5.3`

## Commands Run

```bash
npx pnpm@11.5.3 --filter @bwc/backend-api typecheck
npx pnpm@11.5.3 --filter @bwc/backend-api test
npx pnpm@11.5.3 check
npx pnpm@11.5.3 smoke:browser
```

## Expected Runtime Evidence

The stored-session analysis fixture should return a response containing:

```json
{
  "actionRequestLinks": [
    {
      "actionEventId": "evt_click",
      "requestEventId": "evt_request",
      "requestId": "req_search",
      "responseEventId": "evt_response"
    }
  ],
  "evidenceGraph": {
    "nodes": [],
    "edges": []
  },
  "workflow": {
    "sourceSessionId": "sess_test",
    "steps": [
      {
        "id": "step_evt_request",
        "type": "http.request",
        "method": "POST",
        "url": "https://example.test/api/search?q=books"
      }
    ]
  }
}
```

## Results

- Backend API exposes `POST /sessions/:sessionId/analyze`.
- Stored sessions can be analyzed through existing SQLite-backed event storage.
- The route returns action-request links, Evidence Graph facts, and minimal Workflow IR facts.
- Missing sessions return `404`.
- Typecheck, lint, tests, and build passed.
- Browser Worker smoke still emits the recording event stream used by upstream analysis.
