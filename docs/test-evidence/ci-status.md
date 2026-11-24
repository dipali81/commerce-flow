# CI/CD Status Evidence

## Local preflight (executed before push)

Executed on 24-Nov-2026 with JDK 21.0.12.1, Maven 3.10.0-rc-1, Node 24.14.0 and npm 11.9.0.

| Check | Command | Result | Evidence |
|---|---|---|---|
| Backend verify | `mvn -B -ntp verify` | **BUILD SUCCESS** — 22 tests, 0 failures, 0 errors | `backend-tests.txt` |
| Frontend unit tests | `npm test` | **3 files passed / 8 tests passed** | `frontend-tests.txt` |
| Frontend lint | `npm run lint` | **Passed** | `frontend-checks.txt` |
| Frontend production build | `npm run build` | **Passed** — 10 pages generated | `frontend-checks.txt` |

## Workflow definition

`.github/workflows/ci-cd.yml` is committed and runs on push/PR to `main` or `develop`:

1. `backend` — `mvn verify`, Surefire report upload, JAR upload.
2. `frontend` — `npm ci`, lint, Vitest, `next build`.
3. `release` — on `main` push only, downloads the JAR and creates `v<github.run_number>` GitHub Release.

## Remote status

The remote GitHub Actions run is created by the first push. After pushing, open:

```text
https://github.com/<YOUR_USERNAME>/commerce-flow/actions
```

Expected final line in the Actions run: all three jobs green (`backend`, `frontend`, `release` on `main`). Copy the run URL into your submission along with the repository URL.

Placeholder for your submission:

```text
GitHub repository: https://github.com/<YOUR_USERNAME>/commerce-flow
CI/CD run:         https://github.com/<YOUR_USERNAME>/commerce-flow/actions/runs/<RUN_ID>
Status:            PASS / FAIL (paste actual value after push)
```
