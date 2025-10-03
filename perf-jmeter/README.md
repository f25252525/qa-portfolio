# JMeter Smoke Plan

- **Thread Group:** `smoke` runs 5 virtual users with a 5s ramp and 20s duration to mimic the k6 smoke cadence.
- **Sampler:** `GET users` hits `${BASE_URL}/users?page=2` to mirror the UI/API happy path.
- **Assertion:** Groovy JSR223 check accepts HTTP 200 responses or any payload containing `"data"` so auth-protected mocks still pass.
- **Reporting:** Summary listener (enabled) captures aggregate latency/throughput for quick inspection after CI runs.

**Expected results:** ~5-6 requests/sec with average latency under 1s when targeting the local Prism mock; failures or spikes indicate upstream availability or mock issues that perf smoke should flag.
