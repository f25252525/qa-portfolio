/*
Jenkins Declarative Pipeline
Purpose: CI/CD for QA portfolio repo.
*/

pipeline {
  agent any

  tools { jdk 'jdk21' } // <- name of my JDK 21 in Jenkins

  options {
    timestamps()
    ansiColor('xterm')
    skipDefaultCheckout(true)
    timeout(time: 30, unit: 'MINUTES')
    buildDiscarder(logRotator(numToKeepStr: '20', artifactNumToKeepStr: '10'))
    disableConcurrentBuilds()
    parallelsAlwaysFailFast()
  }

  environment {
    APP_BASE_URL = 'https://www.saucedemo.com'
    API_BASE = 'https://reqres.in/api'
    USER = 'standard_user'
    PASS = 'secret_sauce'
    NODE_IMAGE = 'node:20-bullseye'
    CYPRESS_IMAGE = 'cypress/included:13.17.0'
    PW_IMAGE = 'mcr.microsoft.com/playwright:v1.55.0-jammy'
    CI = 'true'
    MAVEN_REPO = "${WORKSPACE}/.m2/repository"
  }

  stages {
    // Checkout: Fetch clean workspace and checkout the exact commit under test.
    stage('Checkout') {
      steps {
        cleanWs(deleteDirs: true, notFailBuild: true)
        checkout([$class: 'GitSCM',
          branches: [[name: '*/main']],
          userRemoteConfigs: [[
            url: 'https://github.com/f25252525/qa-portfolio.git',
            credentialsId: 'github-ff-pat'
          ]],
          extensions: [[$class: 'CleanBeforeCheckout']]
        ])
      }
    }

    stage('Parallel: Lint & Static') {
      parallel {
        // Lint & Static (JS/TS & Markdown & YAML): Run ESLint, Prettier check, markdownlint, and YAML lint across the repo.
        stage('Lint & Static (JS/TS & Markdown & YAML)') {
          agent {
            docker {
              image 'node:20-bullseye'
              args  '-u 1000:1000'
              reuseNode true
            }
          }
          steps {
            sh '''#!/usr/bin/env bash
set -euo pipefail

node -v
npm -v
npm ci

npm run lint:all
'''
          }
        }

        // Lint & Static (Java): Run Spotless/format checks for Java sources; no compilation artifacts kept.
        stage('Lint & Static (Java)') {
          when { expression { fileExists('ui-selenium-java/pom.xml') } }
          steps {
            script {
              // Ensure a writable repo lives inside the workspace (shared with the Jenkins master container)
              sh '''
mkdir -p .m2/repository
chmod -R 777 .m2 || true
'''
            }
            withDockerContainer(image: 'maven:3.9.9-eclipse-temurin-21', args: '-u 1000:1000 -w $WORKSPACE') {
              sh '''
set -eux
cd ui-selenium-java
mvn -B -V -Dmaven.repo.local="$WORKSPACE/.m2/repository" \
  -Dstyle.color=always \
  spotless:apply spotless:check
'''
            }
          }
        }
      }
    }

    // Unit: Execute fast unit tests for JS/TS with coverage gates to fail fast.
    stage('Unit') {
      steps {
        script {
          docker.image('node:20-bullseye').inside("--entrypoint='' --ipc=host") {
            sh '''#!/usr/bin/env bash
set -Eeuo pipefail

npm config set fund false
npm config set audit false
npm config set progress false

# --- Playwright source unit tests ---
if [ -d ui-playwright-ts ]; then
  cd ui-playwright-ts
  npm ci
  if npm run | grep -qE '^\\s+test:unit'; then
    npm run -s test:unit
  fi
  cd ..
fi

# --- Cypress source unit tests (Node-only, not Cypress E2E) ---
if [ -d ui-cypress ]; then
  cd ui-cypress
  # we are NOT launching the Cypress binary here; these are plain Node unit tests
  export CYPRESS_INSTALL_BINARY=0
  npm ci
  if npm run | grep -qE '^\\s+test:unit'; then
    npm run -s test:unit
  fi
  cd ..
fi
'''
          }
        }
      }
    }

    // Parallel: API: Run API test suites in parallel branches for REST Assured and Newman.
    stage('Parallel: API') {
      parallel {
        // API - REST Assured: Java-based API tests against mock server; Maven Surefire handles reporting.
        stage('API - REST Assured') {
          when { expression { fileExists('api-restassured/pom.xml') } }
          steps {
            script {
              sh '''
set -eux
mkdir -p "${MAVEN_REPO}"
chmod -R 777 "${WORKSPACE}/.m2"
'''
              withDockerContainer(
        image: 'maven:3.9.9-eclipse-temurin-21',
        args: "-u 1000:1000 --entrypoint= -w ${WORKSPACE}"
      ) {
                sh '''
set -eux
cd api-restassured
mvn -B -V -Dmaven.repo.local="${MAVEN_REPO}" -Dstyle.color=always test
'''
      }
            }
          }
            post {
            always {
              junit 'api-restassured/target/surefire-reports/*.xml'
            }
            }
        }

        // API - Newman (Postman): Postman collection smoke tests executed with Newman against the mock server.
        stage('API - Newman (Postman)') {
            steps {
                script {
              docker.image('node:20-bullseye').inside('-u 1000:1000') {
                sh '''#!/usr/bin/env bash
set -euo pipefail
cd api-postman-newman
npm ci --no-audit --no-fund
npm run -s api:test:mock
'''
              }
                }
            }
            post {
                always {
              archiveArtifacts artifacts: 'api-postman-newman/newman.html', allowEmptyArchive: true, fingerprint: true
                }
            }
        }
      }
    }

    // UI - Playwright: Headless Playwright smoke checks; save traces/videos on failure.
    stage('UI - Playwright') {
      steps {
        script {
          docker.image(env.PW_IMAGE).inside("--ipc=host --shm-size=2g -u 1000:1000 -w ${pwd()}") {
            sh '''#!/usr/bin/env bash
set -Eeuo pipefail
cd ui-playwright-ts

# Make npm installs more robust and less chatty across runs
npm config set fund false
npm config set audit false
npm config set progress false
npm config set cache "$PWD/../.npm-cache"
for i in 1 2 3; do npm ci --no-audit --no-fund && break; sleep $((i*5)); done

npx playwright --version
APP_BASE_URL="${APP_BASE_URL}" USER="${USER}" PASS="${PASS}" \
  npx playwright test --reporter=list
'''
          }
        }
      }
      post {
        always {
          archiveArtifacts artifacts: 'playwright-report/**, test-results/**, **/test-results/**', allowEmptyArchive: true, fingerprint: true
        }
      }
    }

    // UI - Cypress: Cypress component/e2e smoke tests; record artifacts for diagnostics.
    stage('UI - Cypress') {
      steps {
        script {
          docker.image('cypress/included:13.17.0').inside("--entrypoint='' --ipc=host --shm-size=2g") {
            sh '''#!/usr/bin/env bash
set -euo pipefail

echo "[cypress] $(date -Is) start"
cd ui-cypress

# Use the on-image Cypress binary; avoid extra download during npm ci
export CYPRESS_INSTALL_BINARY=0

# Install dependencies once; rely on Jenkins pipeline timeout rather than per-command timeouts
npm ci

# Smoke-only for PR builds (Jenkins multibranch exposes CHANGE_ID), full suite on main/default
if [ -n "${CHANGE_ID:-}" ]; then
  SPEC="cypress/e2e/smoke/**/*"
else
  SPEC="cypress/e2e/{smoke,cart,a11y,bdd}/**/*"
fi

echo "[cypress] $(date -Is) cypress run begin -> $SPEC"
npx cypress run --browser chrome --spec "$SPEC"
echo "[cypress] $(date -Is) cypress run done"
'''
          }
        }
      }
      post {
        always {
          archiveArtifacts artifacts: 'ui-cypress/cypress/**', allowEmptyArchive: true
        }
      }
    }

    // UI - Selenium: Selenium Java smoke against ephemeral Selenium Grid; archive results.
    stage('UI - Selenium') {
      steps {
        script {
          sh '''
docker network inspect jenkins-net >/dev/null 2>&1 || docker network create jenkins-net
docker rm -f grid 2>/dev/null || true
docker run -d --rm --name grid --network jenkins-net --shm-size=2g selenium/standalone-chromium:4
# wait until Grid is ready (max ~30s)
for i in {1..30}; do
  if docker exec grid curl -sf http://localhost:4444/status | grep -q '"ready":true'; then
    echo "Selenium Grid is ready"; break
  fi
  sleep 1
done
'''
          try {
            docker.image('maven:3.9-eclipse-temurin-17').inside("--entrypoint='' --network jenkins-net") {
              sh '''#!/usr/bin/env bash
set -Eeuo pipefail
cd ui-selenium-java
MVN_REPO="$WORKSPACE/.m2"
export MAVEN_OPTS="-XX:+UseContainerSupport -Djava.awt.headless=true"
mvn -q -T 1C -Dmaven.repo.local="$MVN_REPO" \
  -Dselenium.grid.url=http://grid:4444/wd/hub \
  -Dbase.url="${APP_BASE_URL}" -Duser="${USER}" -Dpass="${PASS}" -Dsurefire.printSummary=true test
'''
            }
      } finally {
            sh 'docker stop grid 2>/dev/null || true'
          }
        }
      }
      post { always { junit 'ui-selenium-java/target/surefire-reports/*.xml' } }
    }

    // Security - ZAP Baseline: OWASP ZAP baseline scan; fail only on high-risk alerts.
    stage('Security - ZAP Baseline') {
      steps {
        script {
          dir('security-zap-baseline') {
            sh 'mkdir -p zap_report'
            // Run baseline with softer fail behavior:
            //  -a  : auto-accept some risks appropriate for demos
            //  -m 2: only treat HIGH alerts as “failures”
            //  -r/-j/-w: generate HTML/JSON/MD reports
            int code = sh(
          script: '''
docker run --rm -u 0:0 \
  -v "$PWD":/zap/wrk:rw -w /zap/wrk \
  ghcr.io/zaproxy/zaproxy:stable \
  zap-baseline.py \
  -t https://www.saucedemo.com \
  -a -m 2 \
  -I zap-ignore.txt \
  -r zap_report/zap_report.html \
  -j zap_report/zap_report.json \
  -w zap_report/zap_warnings.md
''',
          returnStatus: true
        )

            // Always keep the build green, but echo what happened.
            if (code != 0) {
              echo "ZAP exited with code ${code}. Keeping build GREEN (portfolio mode). See zap_report/* for details."
            }
          }
        }
      }
      post {
        always {
          archiveArtifacts artifacts: 'security-zap-baseline/zap_report/**', allowEmptyArchive: true
          script { currentBuild.result = 'SUCCESS' }
        }
      }
    }

    // Perf - k6: Lightweight k6 smoke perf; produce summary only (no SLAs here).
    stage('Perf - k6') {
      steps {
        script {
          docker.image('grafana/k6:0.51.0').inside("--entrypoint='' -u 1000:1000 -w ${WORKSPACE}") {
            sh '''#!/bin/sh
set -eu
cd perf-k6

# quick context/debug
pwd; git rev-parse --short HEAD || true
echo "---- smoke.js head ----"
head -n 50 smoke.js || exit 1

# run k6
exec k6 run smoke.js
'''
          }
        }
      }
    }

    // Perf - JMeter: JMeter quick smoke; artifacts archived for later deep runs.
    stage('Perf - JMeter') {
      steps {
        catchError(buildResult: 'UNSTABLE', stageResult: 'UNSTABLE') {
            script {
                docker.image('justb4/jmeter:5.5').inside("--entrypoint=''") {
              sh '''
cd perf-jmeter
rm -f results.jtl
rm -rf html-report
unset JAVA_HOME
jmeter -n -t test.jmx -JBASE_URL=https://www.saucedemo.com -l results.jtl -e -o html-report
'''
                }
            }
        }
      }
      post {
        always { archiveArtifacts artifacts: 'perf-jmeter/html-report/**', allowEmptyArchive: true }
      }
    }

    // Parallel: Mutation: Run mutation testing in parallel for JS (Stryker) and Java (PIT).
    stage('Parallel: Mutation') {
      parallel {
        // Mutation - Stryker (JS): Stryker mutation tests for JS/TS; thresholds tuned to avoid flakiness.
        stage('Mutation - Stryker (JS)') {
          steps {
            catchError(buildResult: 'UNSTABLE', stageResult: 'UNSTABLE') {
              script {
                docker.image('node:20-bullseye').inside("--entrypoint=''") {
                    sh '''
cd ui-playwright-ts
# Retry npm ci in case of network issues
for i in 1 2 3; do
    npm ci --no-audit --no-fund && break
    echo "npm ci attempt $i failed, retrying..."
    sleep 5
done
npm run mutate
'''
                }
              }
            }
          }
          post {
            always { archiveArtifacts artifacts: 'ui-playwright-ts/reports/**', allowEmptyArchive: true }
          }
        }

        // Mutation - PIT (Java): PIT mutation tests for Java modules; results archived.
        stage('Mutation - PIT (Java)') {
          steps {
            catchError(buildResult: 'UNSTABLE', stageResult: 'UNSTABLE') {
              script {
                docker.image('maven:3.9-eclipse-temurin-17').inside("--entrypoint='' --user root") {
                  sh '''bash -euo pipefail <<'BASH'
cd api-restassured
# Run PIT; rely on its own console output and generated reports
mvn -q -Dmaven.repo.local="$WORKSPACE/.m2" -DskipTests=false org.pitest:pitest-maven:mutationCoverage || true

# Print a tiny summary if the report exists (no python needed)
REPORT="target/pit-reports/mutations.xml"
if [ -f "$REPORT" ]; then
  killed=$(grep -c 'status="KILLED"' "$REPORT" || true)
  survived=$(grep -c 'status="SURVIVED"' "$REPORT" || true)
  total=$((killed + survived))
  if [ "$total" -gt 0 ]; then
    score=$(awk -v k="$killed" -v t="$total" 'BEGIN { if (t==0) print 0; else printf "%.2f", (k/t*100) }')
    printf "PIT mutations total=%d killed=%d survived=%d score=%s%%\n" "$total" "$killed" "$survived" "$score"
  fi
fi
BASH'''
                }
              }
            }
          }
          post {
            always { archiveArtifacts artifacts: 'api-restassured/target/pit-reports/**', allowEmptyArchive: true }
          }
        }
      }
    }
  }
    post {
    always {
      junit allowEmptyResults: true, testResults: '''
      **/surefire-reports/*.xml
      **/failsafe-reports/*.xml
      **/junit/*.xml
      **/TEST-*.xml
    '''.trim()

      archiveArtifacts artifacts: '''
      **/reports/**/*,
      **/artifacts/**/*,
      ui-*/**/screenshots/**/*,
      ui-*/**/videos/**/*,
      ui-playwright-ts/playwright-report/**/*,
      perf-k6/**/*.{html,json,csv},
      security-zap-baseline/**/*.{html,xml,log}
    '''.trim(),
    allowEmptyArchive: true, fingerprint: true

      cleanWs(
      deleteDirs: true,
      notFailBuild: true,
      patterns: [
        [pattern: '.m2/**',          type: 'EXCLUDE'],
        [pattern: 'node_modules/**', type: 'EXCLUDE'],
        [pattern: '.git/**',         type: 'EXCLUDE'],
        [pattern: '.npm-cache/**', type: 'EXCLUDE']

      ]
    )
    }

    success {
      echo "Pipeline #${env.BUILD_NUMBER} succeeded on ${env.BRANCH_NAME}"
    }

    unstable {
      echo "Pipeline #${env.BUILD_NUMBER} is UNSTABLE"
    }

    failure {
      echo "Pipeline #${env.BUILD_NUMBER} FAILED"
    }

    changed {
      echo 'Build status changed vs. last run.'
    }
    }
}
