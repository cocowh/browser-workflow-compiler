# Step 07 Verification

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

The workflow fixture should produce a step like:

```json
{
  "id": "step_evt_request",
  "type": "http.request",
  "method": "POST",
  "url": "https://example.test/api/search?q=books",
  "evidenceRefs": ["evidence://edge_triggered_link_evt_click_evt_request"]
}
```

## Results

- `@bwc/analysis` generates minimal Workflow IR from Step 04 style Observation IR events plus a Step 06 graph.
- Generated `http.request` steps preserve observed HTTP method and URL.
- Generated workflow and step evidence refs preserve triggered Evidence Graph edge IDs.
- Selected request filtering is deterministic.
- Invalid request observations are skipped.
- Typecheck, lint, tests, and build passed.
- Browser Worker smoke still emits the action, network, and lifecycle event stream needed by the workflow generation fixtures.
