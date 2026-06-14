---
status: implemented
date: 2026-06-14
---

# Minimal Workflow IR Generation

## Goal

Generate the first deterministic Workflow IR from network request observations and Evidence Graph triggered edges.

This capability proves that recorded browser and network evidence can become an editable API-level workflow. It does not replay workflows and does not infer variables.

## Input

`generateMinimalWorkflow` accepts:

- `ObservationEvent[]` containing one or more `network.request` events.
- Optional `EvidenceGraph` from Step 06.
- Optional selected request event IDs.
- Optional workflow ID, name, and source session ID overrides.

When no graph is supplied, `generateMinimalWorkflow` builds one through `buildEvidenceGraph`.

## Output

The function returns a `Workflow` from `@bwc/workflow-ir`.

P0 generated fields:

- `id`: explicit option or stable ID derived from source session ID.
- `name`: explicit option or `Recorded API Workflow`.
- `version`: `1`.
- `sourceSessionId`: explicit option, first selected request session ID, or first event session ID.
- `inputs`: empty object.
- `variables`: empty object.
- `steps`: ordered `http.request` steps.
- `evidenceRefs`: deduplicated workflow-level evidence references from generated steps.

Each generated `http.request` step preserves:

- stable step ID derived from the request event ID.
- HTTP method.
- request URL.
- `evidence://...` references for triggered Evidence Graph edges that target the request node.

## P0 Generation Rules

1. Sort Observation IR events by sequence, timestamp, and ID.
2. Keep `network.request` events only.
3. If selected request event IDs are supplied, generate steps only for those requests.
4. Skip request events that are missing a supported HTTP method or URL.
5. Preserve the observed method and URL without templating.
6. Convert matching triggered graph edge IDs into `evidence://{edgeId}` references.
7. Generate one `http.request` step per valid selected request.

Supported methods:

- `GET`
- `POST`
- `PUT`
- `PATCH`
- `DELETE`
- `HEAD`
- `OPTIONS`

## Acceptance Criteria

- A Step 04 style event stream plus Step 06 graph can produce a minimal Workflow IR.
- Generated HTTP steps preserve method, URL, and evidence references.
- Selected request filtering is deterministic.
- Invalid request observations are skipped rather than producing invalid Workflow IR.
- Typecheck, lint, tests, build, and smoke verification pass.

## Non-scope

- Replay engine implementation.
- Variable extraction and dependency inference.
- Request body reconstruction.
- Header reconstruction.
- Browser-level workflow replay.
- Export to Postman, OpenAPI, AsyncAPI, or code.
