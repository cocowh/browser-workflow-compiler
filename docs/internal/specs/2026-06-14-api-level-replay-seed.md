---
status: implemented
date: 2026-06-14
---

# API-Level Replay Seed

## Goal

Execute minimal Workflow IR `http.request` steps locally and return replay facts that can later be linked back into the Evidence Graph.

This capability proves the P0 route segment from generated Workflow IR to replay result. It intentionally stops before browser replay, variable extraction, retries, and export formats.

## Input

`replayWorkflow` accepts:

- A `Workflow` from `@bwc/workflow-ir`.
- Optional replay ID override.
- Optional injected HTTP client.
- Optional injected clock.
- Optional `continueOnError` flag.

The injected HTTP client is the primary test seam for deterministic unit tests. Production callers may use the default client, which delegates to runtime `fetch`.

## Output

The function returns a `ReplayResult`.

Workflow-level replay facts:

- replay ID.
- source workflow ID.
- overall status: `passed` or `failed`.
- start and end timestamps.
- duration in milliseconds.
- ordered step results.
- deduplicated evidence refs from workflow and executed steps.

Step-level replay facts:

- replay step result ID.
- replay ID and workflow ID.
- Workflow IR step ID.
- step type.
- status: `passed` or `failed`.
- start and end timestamps.
- duration in milliseconds.
- request method and URL.
- response status, status text, and optional content type.
- normalized error name and message when execution fails.
- step evidence refs.

## P0 Replay Rules

1. Execute workflow steps in order.
2. Support only `http.request` steps.
3. Preserve request method, URL, optional headers, and optional body from Workflow IR.
4. Mark a step as passed when:
   - `step.assert.status` exists and response status equals it, or
   - no status assertion exists and response status is between `200` and `399`.
5. Mark a step as failed when the status rule fails or the HTTP client throws.
6. Stop on the first failed step unless `continueOnError` is true.
7. Preserve evidence refs on every step result.
8. Keep replay output separate from Evidence Graph mutation in this step.

## Acceptance Criteria

- A minimal Workflow IR with one HTTP request step can be replayed locally.
- Replay result facts preserve workflow step ID, status or error, timing, and evidence refs.
- Failed response statuses and thrown HTTP client errors are represented as failed replay facts.
- Typecheck, lint, tests, build, and smoke verification pass.

## Non-scope

- Browser-level replay.
- Variable extraction and dependency inference.
- Request templating.
- Rich assertion model.
- Retries and backoff.
- Persisting replay results.
- Converting replay facts into Evidence Graph `replay_result` nodes or `verified_by` edges.
- Export to Postman, OpenAPI, AsyncAPI, or code.
