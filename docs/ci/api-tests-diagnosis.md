Last run analyzed: actions run_id=17724374480 (job: api-tests)

- Newman execution: not present. Log shows the step invoked `npm run -s test` inside `api-postman-newman`, but no `npx newman run ...` output appeared:
  - "npm run -s test"
  - "added 164 packages in 6s"
  - "Process completed with exit code 1."
- Maven execution: not present. No `mvn ... test` lines; the job failed during the Newman step before REST Assured.
- Approx durations:
  - Newman step (install + attempted test): ~8–9s (06:41:56 to 06:42:05 UTC; install logged "in 6s").
  - Maven step: not executed.
- Root-cause hypothesis (concise): The `api-postman-newman` npm test script failed before invoking Newman (missing script or newman dependency), so no `npx newman run` executed and the job aborted before the Maven step.
