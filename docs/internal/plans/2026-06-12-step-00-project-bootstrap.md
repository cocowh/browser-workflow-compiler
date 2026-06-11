---
status: completed
date: 2026-06-12
---

# Step 00 - Project Bootstrap

## Goal

Create the initial project structure so the local development loop can begin.

This step should make the repository capable of hosting:

- Web Console
- Backend API
- Browser Worker
- Shared types and schemas
- First local health checks

## Source Documents

- [Project State](../../project/state.md)
- [P0 Scope](../product/p0-scope.md)
- [System Overview](../architecture/overview.md)
- [Observation IR](../domain/observation-ir.md)
- [Workflow IR](../domain/workflow-ir.md)

## Output

After this step, the repository should contain:

- a monorepo structure
- a frontend app placeholder
- a backend API placeholder
- a browser worker placeholder
- a shared package for types and schemas
- local development commands
- one backend health endpoint
- one browser worker smoke test that can launch Chromium

## Suggested Repository Shape

```text
apps/
  web-console/
  backend-api/
  browser-worker/

packages/
  shared/
  observation-ir/
  workflow-ir/

docs/

scripts/
```

The exact tooling can still be decided during implementation. The important part is that Web Console, Backend API, Browser Worker, and shared schemas are separated early.

## Scope

This step includes:

- choosing the initial monorepo tooling
- creating app and package directories
- adding minimal startup commands
- adding shared type exports
- adding a health check
- adding a browser worker smoke test

## Non-scope

This step does not include:

- real recording
- real network capture
- event storage implementation
- timeline UI
- Evidence Graph persistence
- Workflow IR generation
- replay engine implementation
- exporters

## Tasks

- [x] Choose initial language and package tooling.
- [x] Create monorepo structure.
- [x] Create `apps/web-console`.
- [x] Create `apps/backend-api`.
- [x] Create `apps/browser-worker`.
- [x] Create `packages/shared`.
- [x] Create `packages/observation-ir`.
- [x] Create `packages/workflow-ir`.
- [x] Add local development commands.
- [x] Add Backend API health endpoint.
- [x] Add Browser Worker smoke command.
- [x] Add first shared types for recording session and observation event.
- [x] Add README or developer quickstart.

## Acceptance Criteria

- [x] A developer can install dependencies locally.
- [x] Web Console can start, even if it only shows a placeholder screen.
- [x] Backend API can start and return a health response.
- [x] Browser Worker can start and launch Chromium in a smoke test.
- [x] Shared types can be imported by at least two modules.
- [x] The project has clear commands for local development.

## Test Plan

Minimum checks:

- Run dependency install.
- Start Backend API.
- Call health endpoint.
- Start Web Console.
- Run Browser Worker smoke command.
- Run typecheck or equivalent validation.

## Implementation Summary

Step 00 created the local TypeScript monorepo baseline:

- Root workspace files: `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`, and `pnpm-lock.yaml`.
- Apps: `apps/web-console`, `apps/backend-api`, and `apps/browser-worker`.
- Packages: `packages/shared`, `packages/observation-ir`, and `packages/workflow-ir`.
- Backend API health endpoint: `GET /health`.
- Browser Worker smoke command: `pnpm --filter @bwc/browser-worker smoke`.
- Shared schemas: recording session, observation event, artifact ref, and minimal Workflow IR.

## Verification

See [Step 00 Verification](../testing/2026-06-12-step-00-verification.md).

## Completion Updates

When this step is complete:

1. Updated this file's task list.
2. Updated [Project State](../../project/state.md).
3. Created [Step 01 - Observation IR Ingestion](./2026-06-12-step-01-observation-ir.md).
4. Added Observation IR implementation requirements to the Step 01 plan.

## Notes

Keep Step 00 boring. Its job is to create a clean base, not to solve the whole product.
