---
sidebar_position: 3
status: draft
last_updated: 2026-06-12
---

# Evidence Graph

## Purpose

Evidence Graph explains why the system believes certain observations are related.

Observation IR records facts. Workflow IR describes what to run. Evidence Graph sits between them and explains the reasoning.

## Core Questions

Evidence Graph should help answer:

- Which user action likely triggered this network request?
- Which response field is reused by a later request?
- Which cookie, header, storage value, or URL parameter influenced a request?
- Which workflow step came from which observations?
- Which links are high confidence and which require user review?
- Which generated workflow steps are risky or irreversible?

## Node Types

### action

A user or browser action, usually derived from browser events.

Examples:

- click checkout button
- input email
- navigate to detail page

### request

A network request.

Examples:

- `POST /api/checkout`
- `GET /api/cart`
- GraphQL operation `CreateOrder`

### response

A network response.

Examples:

- status 200 JSON response
- response body containing `cartId`

### field

A field extracted from request, response, headers, cookies, storage, DOM, or URL.

Examples:

- `$.data.cartId`
- `headers.authorization`
- `cookies.csrf_token`

### workflow_step

A generated Workflow IR step.

### replay_result

Evidence from executing a generated workflow.

## Edge Types

### triggered

Links an action to one or more requests.

Example:

```text
action: click Checkout
-> triggered
request: POST /api/checkout
```

### produced

Links a request or response to a field.

Example:

```text
response: GET /api/cart
-> produced
field: $.data.cartId
```

### consumed

Links a later request to a field it uses.

Example:

```text
request: POST /api/checkout
-> consumed
field: $.data.cartId
```

### generated

Links evidence to a generated Workflow IR step.

Example:

```text
request: POST /api/checkout
-> generated
workflow_step: checkout
```

### verified_by

Links a workflow step to a replay result.

Example:

```text
workflow_step: checkout
-> verified_by
replay_result: status 200
```

## Confidence

Edges should include confidence metadata.

```yaml
id: edge_001
type: triggered
from: action_click_checkout
to: request_post_checkout
confidence: 0.82
reason:
  - request started 80ms after click
  - same page URL
  - request initiator was fetch
  - endpoint name matches button text
```

## P0 Evidence Generation

P0 can begin with simple heuristics:

- time window between browser action and request
- same page URL or frame
- request resource type
- static asset filtering
- endpoint path similarity to action text
- GraphQL operation name
- exact or fuzzy field value matching between response and later request

## Current P0 Seed

The first implemented seed graph is intentionally smaller than the full model:

- `action` nodes from `browser.click` and `browser.input` events.
- `request` nodes from `network.request` events.
- `response` nodes from `network.response` events.
- `triggered` edges from Step 05 action-request links.

The seed preserves source Observation IR event IDs and action-request link metadata so later Workflow IR generation can cite the graph without treating it as a new source of truth.

Replay result nodes and `verified_by` edges are planned for Step 09. Step 08 produces replay facts but does not mutate the Evidence Graph yet.

## Human Review

The user should eventually be able to:

- confirm an edge
- reject an edge
- mark a request as noise
- mark a field as variable
- rename workflow steps
- add notes to uncertain evidence

## Why This Matters

The core product advantage is not just capturing traffic. Many tools can capture traffic.

The advantage is building an explainable and replay-verified bridge from real browser behavior to workflow assets.
