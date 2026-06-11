# Glossary

## Browser Workflow Compiler

The product concept. It compiles a real browser operation into a structured workflow that can be explained, edited, replayed, and exported.

## Recording Session

A single captured user operation session. It includes browser actions, page state, network events, screenshots, storage snapshots, generated analysis, and replay results.

## Browser Event

An event produced by the user's browser activity, such as click, input, navigation, wait, page load, screenshot, or DOM snapshot.

## Network Event

An event produced by browser network activity, such as HTTP request, HTTP response, GraphQL operation, WebSocket frame, SSE event, or failed request.

## Observation IR

The low-level factual record of what happened during a recording session. It should preserve facts before the system interprets them.

Observation IR answers:

- What happened?
- When did it happen?
- On which page or frame did it happen?
- What raw evidence supports it?

## Evidence Graph

A graph that explains relationships between observations. It links actions, requests, responses, fields, variables, storage state, replay attempts, and risks.

Evidence Graph answers:

- Why does the system think this click triggered this request?
- Why does this request depend on a previous response field?
- Which evidence supports a generated workflow step?

## Workflow IR

The executable and editable workflow generated from observations and evidence. It is the internal workflow asset that can be replayed and exported.

Workflow IR answers:

- What steps should run?
- What variables are required?
- What should be extracted?
- What should be asserted?
- Which steps need human confirmation?

## Action-Request Linking

The analysis process that associates browser actions with network requests. The first implementation can use time windows and page context. Later versions can add initiator stacks, DOM context, request causality, and replay feedback.

## Field Dependency

A relationship showing that a later request depends on an earlier response, cookie, header, URL parameter, DOM value, storage value, or user input.

## Replay

The process of executing a generated Workflow IR to verify that it works. P0 focuses on API-level replay.

## Export

The process of converting Workflow IR into external formats such as OpenAPI, Arazzo, AsyncAPI, Postman collections, generated code, or custom DSL files.

## Human-in-the-loop

The product design principle that users can review, correct, label, and confirm uncertain analysis results instead of relying on full automation.
