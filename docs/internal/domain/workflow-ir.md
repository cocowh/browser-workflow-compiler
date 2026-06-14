---
sidebar_position: 2
status: draft
last_updated: 2026-06-12
---

# Workflow IR

## Purpose

Workflow IR is the internal executable workflow generated from Observation IR and Evidence Graph.

It should be:

- editable by users
- replayable by the system
- explainable through evidence links
- exportable into standard formats later

## Relationship To Other Models

```text
Observation IR records facts.
Evidence Graph explains relationships.
Workflow IR describes what to run.
Replay Result verifies whether it works.
```

## Minimal P0 Workflow Shape

```yaml
id: wf_checkout
name: Checkout Flow
version: 1
sourceSessionId: sess_checkout
inputs:
  baseUrl:
    type: string
    default: https://shop.example.com
variables: {}
steps:
  - id: get_cart
    type: http.request
    method: GET
    url: "{{baseUrl}}/api/cart"
    extract:
      cartId: "$.data.cartId"
    evidenceRefs:
      - evidence://edge-001

  - id: checkout
    type: http.request
    method: POST
    url: "{{baseUrl}}/api/checkout"
    body:
      cartId: "{{cartId}}"
    assert:
      status: 200
    evidenceRefs:
      - evidence://edge-002
```

## Workflow Fields

- `id`: workflow ID.
- `name`: human-readable workflow name.
- `version`: workflow schema version.
- `sourceSessionId`: recording session used to generate the workflow.
- `inputs`: user-provided values.
- `variables`: extracted runtime values.
- `steps`: ordered workflow steps.
- `evidenceRefs`: optional evidence references at workflow or step level.

## P0 Step Types

### http.request

Sends an HTTP request and optionally extracts response values.

Minimum fields:

- `id`
- `type`
- `method`
- `url`
- `headers`
- `query`
- `body`
- `extract`
- `assert`
- `evidenceRefs`

### extract.variable

Extracts a variable from a prior response or context.

This may be modeled inline inside `http.request` for P0, then separated later if workflows become more complex.

### assert.response

Checks response status, content type, or simple JSON fields.

This may also begin inline inside `http.request`.

### human.confirm

Represents a step that requires human confirmation. This is useful for risky flows such as payment, deletion, or irreversible operations.

This can be reserved for P1 unless needed in P0.

## P0 Requirements

- Workflow IR must be serializable as JSON or YAML.
- Workflow IR must preserve links back to evidence.
- Workflow IR must support API-level replay.
- Workflow IR must support simple variable extraction from JSON responses.
- Workflow IR must support request templating using extracted variables.
- Workflow IR should not depend on browser automation for P0 replay.

## Current P0 Seed

The first implemented Workflow IR generator is intentionally minimal:

- It creates one `http.request` step per selected `network.request` observation.
- It preserves the observed HTTP method and URL.
- It preserves Evidence Graph triggered edge IDs as `evidence://...` refs.
- It leaves inputs, variables, extraction, assertions, replay, and export behavior for later steps.

## Non-goals For P0

- Full programming language semantics.
- Complex branching.
- Loops.
- Parallel execution.
- Full browser replay.
- Full WebSocket workflow modeling.

## Future Extensions

- Conditional steps.
- Retry policies.
- Wait conditions.
- Secret references.
- Browser actions inside workflow.
- WebSocket and SSE steps.
- Export-specific metadata.
- Rich assertion model.
