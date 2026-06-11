# Browser Workflow Compiler

## One-line Definition

Turn real browser operations into explainable, editable, replayable, and exportable workflows.

## Current Project State

- Current phase: [Project State](./state.md)
- Current implementation step: [Step 02 - Browser Event Capture](../internal/plans/2026-06-12-step-02-browser-event-capture.md)
- Current product scope: [P0 Scope](../internal/product/p0-scope.md)

## Foundation Documents

- [Project State](./state.md)
- [Glossary](./glossary.md)
- [Product Definition](../internal/product/product-definition.md)
- [P0 Scope](../internal/product/p0-scope.md)
- [Roadmap](../internal/product/roadmap.md)
- [System Overview](../internal/architecture/overview.md)
- [Observation IR](../internal/domain/observation-ir.md)
- [Workflow IR](../internal/domain/workflow-ir.md)
- [Evidence Graph](../internal/domain/evidence-graph.md)
- [Step 00 - Project Bootstrap](../internal/plans/2026-06-12-step-00-project-bootstrap.md)
- [Step 01 - Observation IR Ingestion](../internal/plans/2026-06-12-step-01-observation-ir.md)
- [Step 02 - Browser Event Capture](../internal/plans/2026-06-12-step-02-browser-event-capture.md)
- [Local Runtime Baseline](../internal/specs/2026-06-12-local-runtime-baseline.md)
- [Observation IR Ingestion](../internal/specs/2026-06-12-observation-ir-ingestion.md)
- [ADR 0001 - Product Positioning and P0 Scope](../internal/adr/0001-product-positioning-and-p0.md)

## Core Concept Chain

```text
User Action
-> Browser Event
-> Network Event
-> Observation IR
-> Evidence Graph
-> Workflow IR
-> Replay Result
-> Export
```

## P0 Goal

Build a local-first loop that can:

1. Record a user's browser operation.
2. Capture the related browser and network events.
3. Store those events as Observation IR.
4. Link user actions to network requests.
5. Generate a minimal Workflow IR.
6. Replay the generated workflow at the API level.

## Main Documentation Areas

- `docs/project/`: stable context for humans and AI agents.
- `docs/internal/product/`: product definition, P0 scope, and roadmap.
- `docs/internal/architecture/`: system-level architecture and runtime structure.
- `docs/internal/domain/`: core data models and intermediate representations.
- `docs/internal/modules/`: long-lived module design notes.
- `docs/internal/specs/`: capability-level specs that combine requirements, solution designs, risks, and acceptance criteria.
- `docs/internal/plans/`: executable step-by-step implementation plans.
- `docs/internal/adr/`: architecture decision records.
- `docs/internal/testing/`: test strategy and verification notes.
- `docs/internal/runbooks/`: troubleshooting, known issues, and operational notes.
- `docs/internal/research/`: external references and product research.
- `docs/zh/`: public Chinese documentation.
- `docs/en/`: public English documentation.
- `docs/fixtures/`: sample IR, sample events, and test fixtures.
- `docs/templates/`: reusable document templates.

## How To Use These Docs

When developing a new capability, follow this order:

```text
P0 Scope
-> Capability Spec
-> Implementation Plan
-> Code
-> Module Doc
-> Test Notes
-> ADR if needed
-> Project State update
```

Do not try to finish every document up front. Let detailed documents grow with the implementation.
