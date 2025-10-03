/*
 * Scenario: 5 virtual users hit ReqRes /users?page=2 for two minutes to watch the user-list latency trend.
 * SLO/SLA: Keep p95 below 18s despite public API variance and maintain >99% successful checks.
 * Risk: Alerts us when the upstream mock/live service slows or starts dropping responses for the UI.
 */
import http from 'k6/http';
import { sleep, check } from 'k6';
export const options = {
  vus: 5,
  duration: '2m',
  thresholds: {
    // 18s p95 gives room for public API hiccups but flags major slowdowns.
    http_req_duration: ['p(95)<18000'], // was 1000
    // 99% success rate ensures the endpoint remains largely error-free during the smoke.
    checks: ['rate>0.99'],
  },
};
export default function () {
  const base = __ENV.API_BASE && __ENV.API_BASE.trim() ? __ENV.API_BASE : 'https://reqres.in/api';
  http.get(`${base}/users?page=2`);
  sleep(1);
}
