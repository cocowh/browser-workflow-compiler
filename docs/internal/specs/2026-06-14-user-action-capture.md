---
status: implemented
date: 2026-06-14
---

# User Action Capture

## Goal

Capture basic user actions as factual Observation IR events during Browser Worker recording.

This capability creates browser action facts that later steps can link to nearby network observations. It does not create Evidence Graph edges or infer action-request relationships.

## Event Types

### `browser.click`

Payload fields:

- `actionId`: stable action ID generated in the browser context.
- `actionType`: `click`.
- `target`: selector-like target hint.
- `tagName`: lowercase target tag name.
- `pageUrl`: browser page URL when the action happened.
- `text`: normalized visible text when safe.
- `isSensitive`: whether the target appears sensitive.
- `browserTimestamp`: timestamp captured in the browser context.

### `browser.input`

Payload fields:

- `actionId`: stable action ID generated in the browser context.
- `actionType`: `input`.
- `target`: selector-like target hint.
- `tagName`: lowercase target tag name.
- `inputType`: input type when available.
- `pageUrl`: browser page URL when the action happened.
- `value`: captured value when the field is not sensitive.
- `valueLength`: captured value length when a value exists.
- `checked`: checkbox/radio state when available.
- `isSensitive`: whether the target appears sensitive.
- `browserTimestamp`: timestamp captured in the browser context.

## Target Hints

P0 target hints prefer stable, compact selectors:

1. `data-testid`
2. `id`
3. `name`
4. `aria-label`
5. tag name fallback

The target hint is not guaranteed to be replay-ready. It is a factual locator clue for later analysis and UI inspection.

## Privacy Rules

- Do not record raw values or visible text for password or hidden inputs.
- Mark password, hidden, password-named, and password-autocomplete fields as `sensitive`.
- Keep `valueLength` for sensitive fields so analysis can know an input occurred without storing the secret.

## Acceptance Criteria

- Browser Worker records at least one click or input event.
- Backend API stores browser action and network events in one session.
- Events preserve monotonic sequence values.
- Typecheck, lint, tests, build, and smoke verification pass.

## Non-scope

- Action-request linking.
- Evidence Graph persistence.
- Workflow IR generation.
- Replay engine implementation.
