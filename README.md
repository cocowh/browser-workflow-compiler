# Browser Workflow Compiler

Browser Workflow Compiler turns real browser operations into explainable, editable, replayable, and exportable workflows.

## Documentation

- [Documentation Home](docs/README.md)
- [Project State](docs/project/state.md)
- [Project Index](docs/project/index.md)
- [Internal Engineering Docs](docs/internal/README.md)
- [中文文档](docs/zh/README.md)
- [English Docs](docs/en/README.md)

## Development Status

The project has completed the initial Step 00 bootstrap and now contains a minimal local runtime skeleton.

## Local Development

The workspace is managed with pnpm. If pnpm is not installed globally, use the pinned version through `npx`.

```bash
npx pnpm@11.5.3 install
npx pnpm@11.5.3 --filter @bwc/browser-worker install:browsers
npx pnpm@11.5.3 format
npx pnpm@11.5.3 lint
npx pnpm@11.5.3 typecheck
npx pnpm@11.5.3 test
npx pnpm@11.5.3 build
```

Start individual services:

```bash
npx pnpm@11.5.3 dev:api
npx pnpm@11.5.3 dev:web
npx pnpm@11.5.3 smoke:browser
npx pnpm@11.5.3 smoke:browser -- --api http://127.0.0.1:4010
```

Default local endpoints:

- Backend API: `http://127.0.0.1:4010/health`
- Web Console: `http://127.0.0.1:5173/`

If port `5173` is already in use, Vite will choose the next available port.

## Runtime Baseline

- Node.js: 24 LTS target, recorded in `.node-version` and `.nvmrc`.
- Package manager: pnpm `11.5.3`.
- Local storage: `.bwc/bwc.sqlite` and `.bwc/artifacts/`.
