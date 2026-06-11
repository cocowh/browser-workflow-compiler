---
status: accepted
date: 2026-06-11
---

# ADR 0001 - Product Positioning and P0 Scope

## Status

Accepted

## Date

2026-06-11

## Context

The original idea started around capturing browser traffic and analyzing call paths. During product analysis, the direction became broader and more precise:

The product should not be a generic packet capture utility or a crawler. Its real value is converting real browser operations into explainable, editable, replayable, and exportable workflows.

Many existing tools can capture traffic. The harder and more valuable part is preserving evidence, linking actions to requests, detecting field dependencies, generating workflows, and validating those workflows through replay.

## Decision

Position the project as Browser Workflow Compiler.

P0 will focus on a local-first workflow:

```text
record browser operation
-> capture browser and network events
-> store Observation IR
-> generate Evidence Graph
-> generate Workflow IR
-> replay workflow
```

P0 will not focus on:

- generic traffic capture as the final product
- fully autonomous web agents
- captcha bypass
- anti-bot evasion
- mobile app capture
- complex binary protocol reverse engineering
- multi-tenant SaaS infrastructure

## Rationale

### Capturing traffic is not enough

Tools such as browser DevTools, Playwright, proxies, and traffic analyzers can already capture requests. The product must add value above capture.

### Workflow generation needs evidence

Generated workflows are only useful if the user can understand where they came from and why they should work.

### Replay is the strongest validation

Replay turns generated workflows from summaries into executable assets.

### Local-first reduces early complexity

P0 should prove the recording-to-replay loop before adding cloud execution, collaboration, or multi-tenant concerns.

## Consequences

### Positive

- Product direction is clearer.
- P0 scope is smaller and more testable.
- Architecture can focus on Observation IR, Evidence Graph, Workflow IR, and replay.
- Future exports can be built on a verified internal workflow model.

### Trade-offs

- The project will not immediately look like a full automation agent.
- Some attractive features are deferred.
- The first demo must be chosen carefully so the local loop is achievable.

### Risks

- The project may still drift toward a generic traffic viewer.
- Evidence Graph may become too complex if implemented too early.
- Workflow IR may become over-designed before replay needs are clear.

## Mitigations

- Keep [P0 Scope](../product/p0-scope.md) as the scope guard.
- Use [Step 00 - Project Bootstrap](../plans/2026-06-12-step-00-project-bootstrap.md) and later step documents to control implementation.
- Only deepen Evidence Graph and Workflow IR when replay needs demand it.
- Record new major decisions as ADRs.
