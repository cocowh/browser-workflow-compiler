# Step 04 Verification

## Environment

- Date: 2026-06-14
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
  "storedEventCount": 7
}
```

The returned `events` array should contain:

```text
0 browser.session_started
1 browser.input
2 browser.click
3 network.request
4 network.response
5 browser.navigate
6 browser.session_stopped
```

The `browser.input` event should include a target hint and safe value metadata. The `browser.click` event should include a target hint and visible text metadata.

## Results

- Browser Worker records input and click events from the default smoke page.
- Browser Worker records the network request and response caused by the click.
- Backend API stores browser action and network events in one session.
- Events preserve monotonic sequence values.
- Typecheck, lint, tests, build, and smoke verification passed.
