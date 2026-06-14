# Project State

## Current Phase

Phase 1 - Local Runtime Foundation

## Current Step

[Step 07 - Minimal Workflow IR Generation](../internal/plans/2026-06-14-step-07-minimal-workflow-ir-generation.md)

## Last Completed

- Completed [Step 00 - Project Bootstrap](../internal/plans/2026-06-12-step-00-project-bootstrap.md).
- Completed [Step 01 - Observation IR Ingestion](../internal/plans/2026-06-12-step-01-observation-ir.md).
- Added validated Backend API routes for sessions and Observation IR events.
- Added local SQLite storage under `.bwc/`.
- Added `@bwc/api-client`.
- Updated Browser Worker smoke so it can post one event to Backend API.
- Split Web Console into initial reusable components and style token files.
- Completed [Step 02 - Browser Event Capture](../internal/plans/2026-06-12-step-02-browser-event-capture.md).
- Added Browser Worker lifecycle recorder for `browser.session_started`, `browser.navigate`, and `browser.session_stopped`.
- Completed [Step 03 - Network Request Capture](../internal/plans/2026-06-12-step-03-network-request-capture.md).
- Added Browser Worker fetch/XHR network capture for `network.request` and `network.response`.
- Completed [Step 04 - User Action Capture](../internal/plans/2026-06-13-step-04-user-action-capture.md).
- Added Browser Worker browser-side action capture for `browser.click` and `browser.input`.
- Completed [Step 05 - Action Request Linking](../internal/plans/2026-06-14-step-05-action-request-linking.md).
- Added `@bwc/analysis` with action-request linking for `browser.click` / `browser.input` and `network.request`.
- Completed [Step 06 - Evidence Graph Seed](../internal/plans/2026-06-14-step-06-evidence-graph-seed.md).
- Added `@bwc/analysis` Evidence Graph seed generation for action, request, response, and triggered edge facts.

## Next Action

1. Start [Step 07 - Minimal Workflow IR Generation](../internal/plans/2026-06-14-step-07-minimal-workflow-ir-generation.md).
2. Generate a minimal Workflow IR from selected network request observations.
3. Preserve Evidence Graph references on generated HTTP request steps.
4. Keep replay execution out until minimal Workflow IR generation is stable.

## Project Summary

Browser Workflow Compiler turns real browser operations into explainable, editable, replayable, and exportable workflows.

The product records what a user actually does in a browser, captures the network traffic and page state around those actions, builds an evidence graph, and generates a workflow that can be replayed and exported.

## Source Documents

- [Project Index](./index.md)
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
- [Step 03 - Network Request Capture](../internal/plans/2026-06-12-step-03-network-request-capture.md)
- [Step 04 - User Action Capture](../internal/plans/2026-06-13-step-04-user-action-capture.md)
- [Step 05 - Action Request Linking](../internal/plans/2026-06-14-step-05-action-request-linking.md)
- [Step 06 - Evidence Graph Seed](../internal/plans/2026-06-14-step-06-evidence-graph-seed.md)
- [Step 07 - Minimal Workflow IR Generation](../internal/plans/2026-06-14-step-07-minimal-workflow-ir-generation.md)
- [Local Runtime Baseline](../internal/specs/2026-06-12-local-runtime-baseline.md)
- [Observation IR Ingestion](../internal/specs/2026-06-12-observation-ir-ingestion.md)
- [Action Request Linking](../internal/specs/2026-06-14-action-request-linking.md)
- [Evidence Graph Seed](../internal/specs/2026-06-14-evidence-graph-seed.md)
- [Network Request Capture](../internal/specs/2026-06-13-network-request-capture.md)
- [User Action Capture](../internal/specs/2026-06-14-user-action-capture.md)
- [Local Runtime Modules](../internal/modules/local-runtime.md)
- [Analysis Module](../internal/modules/analysis.md)
- [Step 00 Verification](../internal/testing/2026-06-12-step-00-verification.md)
- [Step 01 Verification](../internal/testing/2026-06-12-step-01-verification.md)
- [Step 02 Verification](../internal/testing/2026-06-12-step-02-verification.md)
- [Step 03 Verification](../internal/testing/2026-06-13-step-03-verification.md)
- [Step 04 Verification](../internal/testing/2026-06-14-step-04-verification.md)
- [Step 05 Verification](../internal/testing/2026-06-14-step-05-verification.md)
- [Step 06 Verification](../internal/testing/2026-06-14-step-06-verification.md)
- [ADR 0001 - Product Positioning and P0 Scope](../internal/adr/0001-product-positioning-and-p0.md)

## Active Decisions

- Product positioning: Browser Workflow Compiler, not a generic packet capture tool.
- P0 focuses on a local recording, analysis, workflow generation, and replay loop.
- P0 starts with a TypeScript-first pnpm workspace to keep Web Console, Backend API, Browser Worker, and IR packages aligned while contracts are changing.
- Project runtime target is Node 24 LTS.
- Backend API uses Fastify for the first local service boundary.
- Browser Worker should use TypeScript Playwright as the primary runtime.
- Browser Worker lifecycle recording should capture factual browser events before network capture and analysis.
- Browser Worker network capture should record fetch/XHR facts before action-request linking.
- Browser Worker action capture should record click/input facts before action-request linking.
- Action-request linking should stay deterministic and outside Browser Worker.
- Evidence Graph seed generation should stay deterministic and outside Browser Worker.
- Web Console uses React and Vite for the first local workbench.
- Shared schemas use TypeBox / JSON Schema compatible definitions.
- P0 local persistence should use SQLite for indexes and filesystem artifacts for large payloads.
- Browser Worker and Web Console should use `@bwc/api-client` rather than duplicating Backend API fetch logic.
- Git history should use lightweight Conventional Commits and CI checks before heavier local hooks are introduced.
- Observation IR is the source of recorded facts.
- Evidence Graph explains relationships between actions, requests, responses, fields, and replay results.
- Workflow IR is the executable and editable workflow format generated by the system.
- LLMs may help with naming, explanation, draft generation, and repair suggestions, but they must not be the source of truth.
- P0 does not include captcha bypass, anti-bot evasion, mobile app traffic capture, or fully autonomous exploration agents.

## Working Loop

For each new capability:

1. Write or update a capability spec in `docs/internal/specs/`.
2. Write or update an implementation plan in `docs/internal/plans/`.
3. Implement the code.
4. Update the relevant module document in `docs/internal/modules/`.
5. Update testing notes in `docs/internal/testing/`.
6. Add an ADR in `docs/internal/adr/` when a major decision is made.
7. Update this project state file.

## Resume Prompt

When starting a new Codex conversation, use:

```text
Please read docs/project/state.md and docs/project/index.md first, then restore the Browser Workflow Compiler project context and continue from the current step.
```

## Progress Log

### 2026-06-14

- Completed Step 06 Evidence Graph Seed.
- Added `buildEvidenceGraph` to `@bwc/analysis`.
- Added minimal `EvidenceGraph`, `EvidenceGraphNode`, and `EvidenceGraphEdge` output shapes.
- Added deterministic action, request, and response graph nodes from Observation IR events.
- Added `triggered` graph edges that preserve Step 05 action-request link metadata.
- Added Evidence Graph Seed spec, Step 06 verification notes, and Step 07 Minimal Workflow IR Generation plan.
- Completed Step 05 action-request linking.
- Added `@bwc/analysis` package with deterministic `linkActionRequests`.
- Added `ActionRequestLink` output shape with action ID, request ID, matching response event ID, confidence, reason, and time delta.
- Added tests for click linking, input linking, time-window exclusion, and missing ID handling.
- Added Action Request Linking spec, Analysis module notes, Step 05 verification notes, and Step 06 Evidence Graph Seed plan.
- Completed Step 04 user action capture.
- Added Browser Worker browser-side instrumentation for click and input actions.
- Added `browser.click` and `browser.input` Observation IR events with action IDs, target hints, page URLs, safe text/value metadata, and sensitive-field handling.
- Updated the default smoke page so Browser Worker fills an input, clicks a button, and captures the resulting network request/response in one session.
- Added User Action Capture spec, Step 04 verification notes, and Step 05 action-request linking plan.

### 2026-06-13

- Completed Step 03 network request capture.
- Added Browser Worker Playwright network capture for fetch/XHR request and response events.
- Added request IDs, method, URL, response status, timing, JSON/GraphQL/sensitive tags, and artifact reference conventions.
- Added a local smoke page that performs one JSON fetch through a Playwright-fulfilled route.
- Added Network Request Capture spec, Step 03 verification notes, and Step 04 user action capture plan.

### 2026-06-12

- Completed Step 02 browser event capture.
- Added Browser Worker recorder module, event sequencer, and CLI options for API URL and target URL.
- Browser Worker smoke now records `browser.session_started`, `browser.navigate`, and `browser.session_stopped`.
- Added Browser Worker unit tests and Step 02 verification notes.
- Added Step 03 network request capture plan.
- Completed Step 01 Observation IR ingestion.
- Added Backend API session and Observation IR event routes.
- Added SQLite local storage under `.bwc/bwc.sqlite` and `.bwc/artifacts/`.
- Added `@bwc/api-client`.
- Updated Browser Worker smoke to post `browser.session_started` to Backend API.
- Added Node 24 runtime baseline and Biome lint/format.
- Split Web Console into layout, session list, timeline, inspector, UI primitives, demo data, and style token files.
- Added Observation IR ingestion spec, Step 01 verification notes, and Step 02 plan.
- Added lightweight [Git Workflow](../internal/runbooks/git-workflow.md) runbook.
- Added GitHub Actions CI for install and `pnpm check`.
- Completed Step 00 project bootstrap.
- Added pnpm workspace, Turborepo, TypeScript baseline, root scripts, and lockfile.
- Added `apps/web-console`, `apps/backend-api`, and `apps/browser-worker`.
- Added `packages/shared`, `packages/observation-ir`, and `packages/workflow-ir`.
- Added Backend API health endpoint and test.
- Added Browser Worker Chromium smoke command.
- Added Web Console workbench placeholder.
- Added local runtime baseline spec, module notes, Step 00 verification notes, and Step 01 plan.
- Restructured documents into Git project style under `docs/`.
- Added root `AGENTS.md`, root `README.md`, and `docs/README.md`.
- Moved engineering docs under `docs/internal/`.
- Added public documentation roots under `docs/zh/` and `docs/en/`.
- Replaced Obsidian wiki links with GitHub-compatible Markdown links.

### 2026-06-11

- Designed the documentation structure.
- Created the first-phase foundation documentation set.
