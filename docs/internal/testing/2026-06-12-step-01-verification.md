# Step 01 Verification

## Environment

- Date: 2026-06-12
- Runtime target: Node 24 LTS
- Local runtime used for verification: Node.js `v26.0.0`
- Package manager: `npx pnpm@11.5.3`

## Commands Run

```bash
npx pnpm@11.5.3 install
npx pnpm@11.5.3 format
npx pnpm@11.5.3 lint
npx pnpm@11.5.3 typecheck
npx pnpm@11.5.3 test
npx pnpm@11.5.3 build
npx pnpm@11.5.3 smoke:browser
```

Backend and Browser Worker integration smoke:

```bash
npx pnpm@11.5.3 --filter @bwc/backend-api start
npx pnpm@11.5.3 smoke:browser -- --api http://127.0.0.1:4010
```

Web Console render check:

```bash
npx pnpm@11.5.3 --filter @bwc/web-console exec vite --host 127.0.0.1 --port 5175 --strictPort
node --input-type=module -e "..." # Playwright opened the page and saved /tmp/bwc-step01-web.png
```

## Results

- Dependency install completed with the updated eight-package workspace.
- Biome format and lint passed.
- Typecheck passed across all workspace packages.
- Backend API tests passed:
  - health endpoint
  - session creation
  - local `.bwc` SQLite/artifact path creation
  - invalid Observation IR rejection
  - valid Observation IR ingestion
  - event readback in sequence order
  - session mismatch rejection
- Browser Worker standalone smoke launched Chromium.
- Browser Worker API smoke created a session, posted `browser.session_started`, and read the event back.
- Web Console rendered after the component/style split.
- Production build passed.

## Notes

- The local runtime was Node `v26.0.0`, but project metadata now targets Node 24 LTS for long-term maintenance.
- Browser Worker API smoke writes to the default local `.bwc/` directory when Backend API is started without `BWC_DATA_DIR`.
