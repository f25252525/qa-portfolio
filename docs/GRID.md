# Selenium Grid 4 — Local Usage

This project supports running Selenium tests against a local Selenium Grid 4.

Commands:

- Start Grid: `cd docker-grid && docker compose up -d`
- Run smoke on Grid: `cd ui-selenium-java && mvn -q -Dselenium.grid.url=http://localhost:4444/wd/hub -Dbase.url=%APP_BASE_URL% -Duser=%USER% -Dpass=%PASS% -Dtest=*SmokeTest test`
- Stop Grid: `cd docker-grid && docker compose down`

VS Code tasks (Terminal → Run Task):

- `Grid: Up`
- `UI: Selenium (smoke on Grid)`
- `Grid: Down`

Notes:

- Tests also run locally without Grid; BaseTest detects `selenium.grid.url` and switches automatically.
- CI uses a Selenium container service and runs the smoke suite against Grid on pull requests.
