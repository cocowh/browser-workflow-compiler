# Git Workflow

## Purpose

Keep the repository history readable while the project is still moving quickly.

This project uses lightweight git rules first: documented commit conventions and CI checks. Local commit hooks can be added later when repeated mistakes justify the extra friction.

## Commit Message Format

Use Conventional Commits:

```text
<type>(<scope>): <subject>
```

The scope is optional, but recommended when the change is focused.

## Types

- `feat`: user-visible capability or product behavior.
- `fix`: bug fix.
- `docs`: documentation-only change.
- `test`: tests or verification changes.
- `refactor`: code restructuring without intended behavior change.
- `chore`: maintenance work.
- `build`: dependency, packaging, or build-system change.
- `ci`: CI workflow change.
- `style`: formatting or visual styling without product behavior change.
- `perf`: performance improvement.
- `revert`: revert a previous change.

## Recommended Scopes

- `root`
- `docs`
- `web-console`
- `backend-api`
- `browser-worker`
- `api-client`
- `observation-ir`
- `workflow-ir`
- `shared`
- `testing`
- `ci`

## Examples

```text
feat(root): bootstrap local runtime
feat(backend-api): add observation event ingestion
feat(browser-worker): post smoke event to backend api
docs(project): update state for step 01
test(backend-api): cover session event persistence
chore(root): add biome and node baseline
ci(root): add workspace check workflow
```

## Branch Naming

Use short, descriptive branch names:

```text
feat/step-02-browser-event-capture
fix/backend-event-ordering
docs/git-workflow
chore/node-baseline
```

## Before Committing

Run:

```bash
npx pnpm@11.5.3 check
npx pnpm@11.5.3 smoke:browser
```

When Backend API is already running, also verify the ingestion smoke:

```bash
npx pnpm@11.5.3 smoke:browser -- --api http://127.0.0.1:4010
```

## CI

GitHub Actions runs:

```bash
pnpm install
pnpm check
```

CI intentionally does not run Playwright browser smoke yet because it requires browser runtime setup and is slower than the baseline gate.

## Do Not Commit

- Real cookies, tokens, credentials, or private request bodies.
- Sensitive screenshots or DOM captures.
- Local runtime data under `.bwc/`.
- Build outputs such as `dist/`.
- Turborepo outputs such as `.turbo/`.
- Local IDE state such as `.idea/`.

## First Commit Recommendation

For the current bootstrap and Observation IR ingestion baseline:

```bash
git add .
git commit -m "feat(root): bootstrap local runtime and observation ingestion"
```

