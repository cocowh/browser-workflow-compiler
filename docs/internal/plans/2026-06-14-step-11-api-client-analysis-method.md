---
status: planned
date: 2026-06-14
---

# Step 11 - API Client Analysis Method

## Goal

Expose the Backend Analysis API through `@bwc/api-client`.

This step should let local callers use the analysis route without duplicating fetch logic or hard-coding Backend API paths.

## Source Documents

- [Project State](../../project/state.md)
- [P0 Scope](../product/p0-scope.md)
- [Backend Analysis API Seed](../specs/2026-06-14-backend-analysis-api-seed.md)
- [Step 10 - Backend Analysis API Seed](./2026-06-14-step-10-backend-analysis-api-seed.md)

## Requirements

- Add an API client method for `POST /sessions/:sessionId/analyze`.
- Reuse the existing API client request conventions.
- Return the Backend API analysis response shape without duplicating analysis logic.
- Add API client tests for success and Backend API error propagation.
- Keep Web Console rendering out until the client method is stable.

## Tasks

- [ ] Write or update an API Client Analysis capability spec.
- [ ] Add the API client method.
- [ ] Add tests for success and error responses.
- [ ] Update module and testing docs.
- [ ] Update [Project State](../../project/state.md) when complete.

## Acceptance Criteria

- Local callers can request session analysis through `@bwc/api-client`.
- Tests prove the method calls the expected route and returns analysis facts.
- Typecheck, lint, tests, build, and smoke verification pass.

## Non-scope

- Web Console rendering.
- Backend API route changes.
- Running live replay requests.
- Persisting analysis snapshots.
