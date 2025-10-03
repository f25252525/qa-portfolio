Last CI run on main: run_id=17720481937

- ui-playwright: Unit test files under `ui-playwright-ts/__tests__` were executed outside a test runner, causing "describe is not defined". Fix: run these under Playwright Test (move into `ui-playwright-ts/tests` and use `test()`), or add Vitest/Jest and invoke that, or exclude `__tests__` from the job.
- perf-jmeter: Docker image `justb4/jmeter:5.6.3` not found (manifest unknown). Fix: switch to a valid tag (e.g., `justb4/jmeter:5.6.2`) or `latest`, then continue to generate/upload the HTML dashboard.
- zap-baseline: Scan completed but the "create GitHub issue" step failed with 403 "Resource not accessible by integration" (GITHUB_TOKEN lacks `issues:write`). Fix: add `permissions: issues: write` for the job or disable/`continue-on-error` for the issue-creation step; ensure `zap.html` uploads and the job doesn’t fail on alerts.
- mutation-java: Job passed; PIT report artifact not found (`api-restassured/target/pit-reports/**`). Optional fix: ensure PIT generates `mutations.xml` (configure pitest plugin) so the artifact uploads.
