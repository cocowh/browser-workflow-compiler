---
status: implemented
date: 2026-06-12
---

# Local Runtime Baseline

## Purpose

Define the first maintainable runtime shape for Browser Workflow Compiler.

The product should start as a local-first developer workbench with a Web Console, Backend API, Browser Worker, and shared IR schema packages.

## Decision

Use a TypeScript-first monorepo for P0:

- pnpm workspace for package management.
- Turborepo for workspace task orchestration.
- React and Vite for Web Console.
- Fastify for Backend API.
- Playwright for Browser Worker.
- TypeBox schemas for shared runtime validation and TypeScript types.

## Rationale

P0 needs fast iteration across browser automation, UI, API, and schema contracts. Keeping these modules in TypeScript allows Observation IR and Workflow IR types to be shared directly while the contracts are still evolving.

The architecture still leaves room for later Go or Python services:

- Go is a good future fit for local daemon, proxy, or single-binary runner work.
- Python is a good future fit for heavier analysis, LLM-assisted repair, or data processing.
- JSON Schema and Workflow IR should become the language boundary if those services are introduced.

## Acceptance Criteria

- The repository has separate app directories for Web Console, Backend API, and Browser Worker.
- Shared packages expose Recording Session, Observation IR, and Workflow IR schemas.
- Backend API exposes a health endpoint.
- Browser Worker can launch Chromium in a smoke test.
- Web Console can start locally.
- Workspace-level install, typecheck, test, and build commands exist.

## Follow-up

Step 01 should use this baseline to implement validated Observation IR ingestion and local persistence.
