# Replay Module

## Purpose

The replay module executes generated Workflow IR and returns replay facts.

Replay is intentionally separate from analysis. Analysis derives deterministic facts from recorded observations, while replay performs runtime work and may fail because of network, server, or environment conditions.

## Current Structure

```text
packages/
  replay/
```

## Current Role

Path: `packages/replay`

- Exposes `replayWorkflow`.
- Accepts `Workflow` objects from `@bwc/workflow-ir`.
- Executes minimal `http.request` steps.
- Preserves workflow IDs, step IDs, evidence refs, response status facts, timing facts, and normalized error facts.
- Supports injected HTTP clients for deterministic tests.
- Supports injected clocks for deterministic timing assertions.
- Stops on first failed step by default.

## Maintenance Notes

- Keep runtime execution out of `@bwc/analysis`.
- Keep replay output factual and small until Evidence Graph integration is implemented.
- Keep default `fetch` behavior replaceable through dependency injection.
- Avoid adding browser automation here until API-level replay is stable.
- Add variable extraction, request templating, and richer assertions only after replay result evidence is connected to the product loop.
