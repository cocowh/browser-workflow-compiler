# Step 09 Verification

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

The replay evidence fixture should produce a `verified_by` edge like:

```json
{
  "type": "verified_by",
  "fromNodeId": "node_workflow_step_wf_search_step_evt_request",
  "toNodeId": "node_replay_result_replay_search_replay_step_replay_search_step_evt_request",
  "reason": "replay_result_for_workflow_step",
  "metadata": {
    "workflowId": "wf_search",
    "workflowStepId": "step_evt_request",
    "replayId": "replay_search",
    "replayStepResultId": "replay_step_replay_search_step_evt_request",
    "status": "passed",
    "responseStatus": 200
  }
}
```

## Results

- `@bwc/analysis` converts replay results into deterministic Evidence Graph additions.
- Workflow step nodes preserve generated Workflow IR step facts and evidence refs.
- Replay result nodes preserve status, timing, request, response, error, and evidence ref facts.
- `verified_by` edges link workflow step evidence to replay result evidence.
- Passed and failed replay result fixtures are covered.
- Typecheck, lint, tests, and build passed.
- Browser Worker smoke still emits the recording event stream needed by the upstream P0 path.
