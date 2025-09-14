# AGENTS

This repository contains a Next.js application. Follow these guidelines when working in this repo.

## Setup
- Ensure Node.js 18+ is installed.
- Install dependencies:
  ```bash
  npm install
  ```
- Define required environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Run
- Start development server:
  ```bash
  npm run dev
  ```
- Build for production:
  ```bash
  npm run build
  ```
- Start production server:
  ```bash
  npm run start
  ```

## Test
- Run lint checks:
  ```bash
  npm run lint
  ```

- Run unit and smoke tests with Node's built-in runner:
  ```bash
  npm test
  ```

## CI
- This repo includes GitHub Actions at `.github/workflows/ci.yml`.
- CI runs `npm test` on every push and pull request (Node 18 and 20).
- Contributions must be green in CI. If you change behavior, update or add tests under `tests/`.

- Run unit and smoke tests with Node's built-in runner:
  ```bash
  npm test
  ```

### Policy for Codex contributions
- Always run `npm test` before and after changes. Do not submit patches if tests fail.
- If you change behavior in `utils/` or add new user-visible logic, add or update tests under `tests/` in the same PR.
- Keep tests dependency-free (use Node's built-in `node:test` and `assert`), unless explicitly approved to add a test framework.
- Avoid flaky tests; prefer deterministic checks and file-based smoke tests.

### Current tests
- `tests/currentSeason.test.js` validates season calculation.
- `tests/projectSmoke.test.js` checks ICS route presence, seasonal template labels, README live demo link, and `.env.example` keys.
