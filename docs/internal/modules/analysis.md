# Analysis Module

## Purpose

The analysis module turns factual Observation IR events into small derived facts that can later feed Evidence Graph and Workflow IR generation.

Analysis code should remain deterministic and testable. It should not perform browser automation, persistence, replay, or LLM calls.

## Current Structure

```text
packages/
  analysis/
```

## Current Role

Path: `packages/analysis`

- Exposes `linkActionRequests`.
- Accepts Observation IR events.
- Links `browser.click` and `browser.input` events to nearby `network.request` events.
- Preserves matching `network.response` event IDs through shared `requestId`.
- Emits `ActionRequestLink` objects with action ID, request ID, confidence, reason, and time delta.

## Maintenance Notes

- Keep heuristics explicit and covered by fixtures.
- Keep analysis outputs separate from Observation IR facts.
- Prefer deterministic rules before introducing LLM-assisted explanation or repair.
- Do not add persistence here; storage belongs behind Backend API when a durable Evidence Graph boundary is introduced.
