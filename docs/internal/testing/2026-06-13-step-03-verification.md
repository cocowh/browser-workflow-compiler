# Step 03 Verification

## Environment

- Date: 2026-06-13
- Runtime target: Node 24 LTS
- Local runtime used for verification: Node.js `v26.0.0`
- Package manager: `npx pnpm@11.5.3`

## Commands Run

```bash
npx pnpm@11.5.3 --filter @bwc/browser-worker typecheck
npx pnpm@11.5.3 --filter @bwc/browser-worker test
npx pnpm@11.5.3 smoke:browser
npx pnpm@11.5.3 check
```

Backend and Browser Worker integration smoke:

```bash
npx pnpm@11.5.3 --filter @bwc/backend-api start
npx pnpm@11.5.3 smoke:browser -- --api http://127.0.0.1:4010
curl -s http://127.0.0.1:4010/sessions/{sessionId}/events
```

## Expected Runtime Evidence

The Browser Worker smoke should return:

```json
{
  "ok": true,
  "posted": true,
  "storedEventCount": 5
}
```

The returned `events` array should contain at least:

```text
browser.session_started
network.request
network.response
browser.navigate
browser.session_stopped
```

The `network.request` and `network.response` events should share the same `requestId`.

## Results

- Browser Worker records one fetch request from the default smoke page.
- Browser Worker records the matching fetch response.
- Network events include request ID, method, URL, status, tags, timing, and artifact reference conventions.
- Backend API stores and returns browser and network events in sequence order.
- Typecheck, lint, tests, build, and smoke verification passed.
