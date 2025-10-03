# QA Test Automation Portfolio

[![GitHub Actions CI](https://img.shields.io/github/actions/workflow/status/f25252525/qa-portfolio/ci.yml?branch=main&label=GitHub%20Actions)](https://github.com/f25252525/qa-portfolio/actions/workflows/ci.yml)
![Jenkins](https://img.shields.io/badge/Jenkins-multibranch-blue)
![Tech stack](https://img.shields.io/badge/Stack-Cypress%20%7C%20Playwright%20%7C%20Selenium%20%7C%20Postman%20%7C%20REST%20Assured%20%7C%20k6%20%7C%20JMeter%20%7C%20ZAP-brightgreen)

## About

My name is **Fraser**, and this is my recruiter-friendly, batteries-included QA portfolio that demonstrates breadth (UI, API, perf, security) **and** engineering rigor (linting, mutation testing, artifacts, CI/CD). It runs the same way on GitHub Actions and Jenkins with clear stage parity, smoke/full gating, visual + a11y checks, and a local mock to avoid flaky external APIs.

> **If you’re skimming:** open `ci.yml` for the pipeline story, `Jenkinsfile` for parity, and the `ui-*` / `api-*` folders for representative tests. The “Stage parity” table below maps everything.

## How to Run Locally

- **Prereqs:** Node 20, Java 17, Docker (for Grid/ZAP/JMeter), k6 (optional).
- **UI:** `cd ui-cypress && npm run test:smoke`, `cd ui-playwright-ts && npx playwright test --reporter=line`, `cd ui-selenium-java && mvn -q -Dtest=*Smoke* test`.
- **API:** `cd api-postman-newman && npm run api:test:mock`, `cd api-restassured && mvn -q test`.
- **Perf:** `k6 run perf-k6/smoke.js`; `docker run --rm -v "$PWD/perf-jmeter":/jmeter -w /jmeter justb4/jmeter:5.5 -n -t test.jmx -l results.jtl -e -o html-report`.
- **Security:** `docker run --rm -t ghcr.io/zaproxy/zaproxy:stable zap-baseline.py -t https://www.saucedemo.com -g security-zap-baseline/zap-ignore.txt -r zap.html`.
- **Defaults:** `APP_BASE_URL=https://www.saucedemo.com`, `API_BASE=https://reqres.in/api`, `USER=standard_user`, `PASS=secret_sauce`.

## CI Overview

- **GitHub Actions:** Full matrix (Cypress, Playwright, Selenium, Newman, REST Assured, mutation, perf, ZAP). Applitools Eyes visual checks run _only_ here.
- **Jenkins:** Multibranch pipeline mirrors Actions using containerised stages (Cypress included image, Playwright Jammy, Maven + Selenium Grid, Newman mock, perf, ZAP, mutation). Artifacts uploaded from both systems (videos, HTML reports, mutation dashboards).
- **Stage parity:**

| Actions & Jenkins (stages)        | Notes                                                |
| --------------------------------- | ---------------------------------------------------- |
| **Bootstrap: Toolchain & Caches** | (Node 20 + Temurin JDK setup).                       |
| **Quality: Lint & Static**        | ESLint, Prettier, markdownlint, YAML; Java Spotless. |
| **Unit**                          | **Unit** gate before suites.                         |
| **API – REST Assured**            | Surefire results archived.                           |
| **API – Newman (mock)**           | Hits local Prism mock (`http://localhost:4010`).     |
| **UI – Playwright**               | a11y                                                 |
| **UI – Cypress**                  | BDD + a11y; Applitools in Actions.                   |
| **UI – Selenium**                 | Runs on Grid.                                        |
| **Perf - ZAP Baseline**           | Non-blocking baseline scan.                          |
| **Perf - k6**                     | Gated after UI & API.                                |
| **Perf - JMeter**                 | **JMeter smoke** via Docker.                         |
| **Mutation: Stryker (JS)**        | Typically on `main` / schedule.                      |
| **Mutation: PIT (Java)**          | Typically on `main` / schedule.                      |
| **Post: Archive Artifacts**       | Archives per stage and also bundles all artifacts.   |

## Outputs & Smoke Locations

- **UI smokes:** Cypress `cypress/e2e/smoke/login.cy.js`, Playwright `tests/smoke/login.spec.ts`, Selenium `tests/smoke/LoginSmokeTest.java`.
- **Accessibility:** Cypress `cypress/e2e/a11y/home.cy.js`, Playwright `tests/a11y/home-a11y.spec.ts`.
- **Visual:** Cypress `cypress/e2e/visual/applitools.cy.js` (Eyes via Actions).
- **API:** Postman / Newman collection (`api-postman-newman/collection.json`) + REST Assured tests (`ApiTests.java`).
- **Perf/Security:** k6 smoke (`perf-k6/smoke.js`), JMeter plan (`perf-jmeter/test.jmx`), ZAP baseline (`security-zap-baseline/zap.yaml`).
- **Artifacts:** `ui-cypress/cypress/videos/**`, `ui-playwright-ts/playwright-report/**`, `api-postman-newman/newman.html`, `perf-jmeter/html-report/**`, `security-zap-baseline/zap.html`, mutation reports under `ui-playwright-ts/reports/mutation/` and `api-restassured/target/pit-reports/`.

## Design Tradeoffs

1. **Mock-first APIs:** Prism-powered Newman runs keep CI deterministic while offering a `npm run api:test:real` escape hatch for live Postman checks.
2. **Selective visuals:** Eyes stays on GitHub Actions to leverage cloud resources.
3. **Mutation thresholds:** Stryker (80/60/0) and PIT (break=0) surface quality regressions without blocking small suites; dashboards provide evidence for deeper review.
4. **Lightweight perf & security:** Short k6/JMeter/ZAP smokes provide trend signals without lengthening CI beyond two minutes.

## For recruiters

- **Contact:** Drop issues/PRs or reach out via resume email for walkthroughs.
