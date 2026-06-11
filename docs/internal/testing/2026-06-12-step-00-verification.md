# Step 00 Verification

## Environment

- Date: 2026-06-12
- Node.js: `v26.0.0`
- Package manager: `npx pnpm@11.5.3`

## Commands Run

```bash
npx pnpm@11.5.3 install
npx pnpm@11.5.3 --filter @bwc/browser-worker install:browsers
npx pnpm@11.5.3 typecheck
npx pnpm@11.5.3 test
npx pnpm@11.5.3 smoke:browser
npx pnpm@11.5.3 --filter @bwc/backend-api start
curl -sS http://127.0.0.1:4010/health
npx pnpm@11.5.3 --filter @bwc/web-console dev
curl -sS -I http://127.0.0.1:5174/
npx pnpm@11.5.3 build
```

Additional Web Console render check:

```bash
npx pnpm@11.5.3 --filter @bwc/web-console exec vite --host 127.0.0.1 --port 5175 --strictPort
node --input-type=module -e "..." # Playwright opened the page and saved /tmp/bwc-step00-web.png
```

## Results

- Dependency install completed and generated `pnpm-lock.yaml`.
- Typecheck passed across all workspace packages.
- Backend API test passed.
- Browser Worker smoke launched Chromium and emitted a sample `browser.session_started` event.
- Backend API returned a successful health response from `GET /health`.
- Web Console started through Vite and returned `HTTP/1.1 200 OK`.
- Web Console rendered in Playwright with the expected workbench shell, timeline, and inspector content.
- Production build passed.

## Notes

- `pnpm` was not installed globally on this machine, so validation used `npx pnpm@11.5.3`.
- Playwright browser installation had transient network failures while downloading Chromium artifacts, then succeeded on retry.
- Port `5173` was already in use during verification, so Vite selected `5174`.
- The in-app Browser surface was unavailable during verification, so the UI render check used the installed Playwright runtime as a fallback.
