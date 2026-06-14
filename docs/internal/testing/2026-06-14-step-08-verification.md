# Step 08 Verification

## Environment

- Date: 2026-06-14
- Runtime target: Node 24 LTS
- Local runtime used for verification: Node.js `v26.0.0`
- Package manager: `npx pnpm@11.5.3`

## Commands Run

```bash
npx pnpm@11.5.3 --filter @bwc/replay typecheck
npx pnpm@11.5.3 --filter @bwc/replay test
npx pnpm@11.5.3 check
npx pnpm@11.5.3 smoke:browser
```

## Expected Runtime Evidence

The replay fixture should produce a step result like:

```json
{
  "stepId": "step_evt_request",
  "stepType": "http.request",
  "status": "passed",
  "request": {
    "method": "POST",
    "url": "https://example.test/api/search?q=books"
  },
  "response": {
    "status": 200,
    "statusText": "OK",
    "contentType": "application/json"
  },
  "evidenceRefs": ["evidence://edge_triggered_link_evt_click_evt_request"]
}
```

## Results

- `@bwc/replay` replays a minimal one-step Workflow IR through an injected HTTP client.
- Replay results preserve workflow ID, step ID, replay status, timing, request facts, response facts, and evidence refs.
- Failed assertion status responses produce failed step and workflow results.
- Thrown HTTP client errors produce failed step results with normalized error facts.
- Typecheck, lint, tests, and build passed.
- Browser Worker smoke still emits the action, network, and lifecycle event stream needed by the recording-to-workflow path.
