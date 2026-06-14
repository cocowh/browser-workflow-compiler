# Documentation

This directory is the canonical project documentation source for Browser Workflow Compiler.

## 1. Project Context

- [Project State](./project/state.md)
- [Project Index](./project/index.md)
- [Glossary](./project/glossary.md)

## 2. Internal Engineering Docs

- [Internal Docs](./internal/README.md)
- [Product Definition](./internal/product/product-definition.md)
- [P0 Scope](./internal/product/p0-scope.md)
- [System Overview](./internal/architecture/overview.md)
- [Observation IR](./internal/domain/observation-ir.md)
- [Workflow IR](./internal/domain/workflow-ir.md)
- [Evidence Graph](./internal/domain/evidence-graph.md)
- [Step 00 - Project Bootstrap](./internal/plans/2026-06-12-step-00-project-bootstrap.md)
- [Step 01 - Observation IR Ingestion](./internal/plans/2026-06-12-step-01-observation-ir.md)
- [Step 02 - Browser Event Capture](./internal/plans/2026-06-12-step-02-browser-event-capture.md)
- [Step 03 - Network Request Capture](./internal/plans/2026-06-12-step-03-network-request-capture.md)
- [Step 04 - User Action Capture](./internal/plans/2026-06-13-step-04-user-action-capture.md)
- [Step 05 - Action Request Linking](./internal/plans/2026-06-14-step-05-action-request-linking.md)
- [Step 06 - Evidence Graph Seed](./internal/plans/2026-06-14-step-06-evidence-graph-seed.md)
- [Step 07 - Minimal Workflow IR Generation](./internal/plans/2026-06-14-step-07-minimal-workflow-ir-generation.md)
- [Step 08 - API-Level Replay Seed](./internal/plans/2026-06-14-step-08-api-level-replay-seed.md)
- [Step 09 - Replay Result Evidence](./internal/plans/2026-06-14-step-09-replay-result-evidence.md)
- [Step 10 - Backend Analysis API Seed](./internal/plans/2026-06-14-step-10-backend-analysis-api-seed.md)
- [Step 11 - API Client Analysis Method](./internal/plans/2026-06-14-step-11-api-client-analysis-method.md)
- [Local Runtime Baseline](./internal/specs/2026-06-12-local-runtime-baseline.md)
- [Observation IR Ingestion](./internal/specs/2026-06-12-observation-ir-ingestion.md)
- [Action Request Linking](./internal/specs/2026-06-14-action-request-linking.md)
- [API-Level Replay Seed](./internal/specs/2026-06-14-api-level-replay-seed.md)
- [Backend Analysis API Seed](./internal/specs/2026-06-14-backend-analysis-api-seed.md)
- [Evidence Graph Seed](./internal/specs/2026-06-14-evidence-graph-seed.md)
- [Minimal Workflow IR Generation](./internal/specs/2026-06-14-minimal-workflow-ir-generation.md)
- [Network Request Capture](./internal/specs/2026-06-13-network-request-capture.md)
- [Replay Result Evidence](./internal/specs/2026-06-14-replay-result-evidence.md)
- [User Action Capture](./internal/specs/2026-06-14-user-action-capture.md)
- [ADR 0001 - Product Positioning and P0 Scope](./internal/adr/0001-product-positioning-and-p0.md)

## 3. Public Docs

- [中文文档](./zh/README.md)
- [English Docs](./en/README.md)

## Documentation Workflow

```text
Product Scope
-> Capability Spec
-> Implementation Plan
-> Code
-> Module Doc
-> Test Notes
-> ADR if needed
-> Project State update
```
