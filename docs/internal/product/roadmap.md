---
sidebar_position: 3
status: draft
last_updated: 2026-06-12
---

# Roadmap

## Roadmap Principle

Build the product around a verified loop, not around a long list of integrations.

Each phase should produce something observable and replayable.

## P0 - Local Recorder and Replay Loop

Goal: prove that a local recording can become a replayable workflow.

Key capabilities:

- Local Chromium recording.
- Browser event capture.
- Fetch/XHR network capture.
- Observation IR storage.
- Timeline UI.
- Action-request linking.
- Minimal Workflow IR generation.
- API-level replay.

Primary output:

- A working local demo that records a simple browser flow and replays the generated API workflow.

## P1 - Better Evidence and Dependency Analysis

Goal: improve explanation quality and dependency detection.

Key capabilities:

- Evidence Graph persistence.
- Better field dependency detection.
- Request clustering.
- Noise filtering.
- Confidence scores.
- User correction workflow.

Primary output:

- A user can understand why a generated workflow step exists and correct it when needed.

## P2 - Workflow Editing and Replay Hardening

Goal: make Workflow IR practical as an editable asset.

Key capabilities:

- Workflow editor.
- Variable editor.
- Assertion editor.
- Replay diff viewer.
- Retry and wait policies.
- Sensitive value handling.

Primary output:

- A user can edit, replay, and stabilize generated workflows.

## P3 - Standard Exports

Goal: make generated workflows useful outside the product.

Key capabilities:

- OpenAPI export for discovered HTTP APIs.
- Arazzo export for multi-step workflows.
- Postman collection export.
- Custom DSL export.
- Early code generation.

Primary output:

- A replayed workflow can be exported into a standard toolchain.

## P4 - Guided Automation and Agent Assistance

Goal: add automation only after the evidence and replay loop is reliable.

Key capabilities:

- LLM-assisted workflow naming and explanation.
- LLM-assisted repair suggestions after replay failure.
- Guided exploration with user approval.
- Semi-automatic workflow expansion.

Primary output:

- The system can suggest next steps while keeping evidence, user control, and replay validation at the center.
