@echo off
setlocal

echo [pre-commit] Running Spotless for Java...
mvn -q spotless:apply
if errorlevel 1 (
  echo [pre-commit] Spotless failed. Aborting commit.
  exit /b 1
)

REM If you also want to enforce formatting without changing the commit automatically,
REM replace the above with: mvn -q spotless:check

REM Optionally lint/format JS if package.json exists
if exist package.json (
  echo [pre-commit] Linting JS with ESLint...
  call npm run -s lint
  if errorlevel 1 exit /b 1

  echo [pre-commit] Formatting JS with Prettier...
  call npm run -s fmt
  if errorlevel 1 exit /b 1
)

REM Stage any files modified by the formatters so this commit includes them
git add -A

echo [pre-commit] OK.
endlocal

