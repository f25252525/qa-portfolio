<#
  Purge generated artifacts from the working tree (Windows PowerShell).
  - Leaves source code intact.
  - Idempotent: safe to re-run.
  - Optional: commits the deletions (-Commit).

  USAGE (from repo root):
    powershell -ExecutionPolicy Bypass -File scripts/purge-generated.ps1 -Commit
    # or dry-run first:
    powershell -ExecutionPolicy Bypass -File scripts/purge-generated.ps1 -DryRun
#>

[CmdletBinding()]
param(
  [switch]$Commit,
  [switch]$DryRun
)

function Info($msg)  { Write-Host "[INFO]  $msg" -ForegroundColor Cyan }
function Warn($msg)  { Write-Host "[WARN]  $msg" -ForegroundColor Yellow }
function Done($msg)  { Write-Host "[OK]    $msg" -ForegroundColor Green }
function Skip($msg)  { Write-Host "[SKIP]  $msg" -ForegroundColor DarkGray }

# Guard: must be repo root (has .git)
if (-not (Test-Path .git)) {
  Warn "This doesn't look like a Git repo root ('.git' missing)."
  Warn "Run this from the repository root."
  exit 2
}

# --- What we remove by default (generated stuff only) ---
# Add/remove paths to taste. Wildcards ok.
$artifactPaths = @(
  # Global bundles / temp
  'all-artifacts.tgz',
  'collected',

  # Top-level artifacts folder (old checked-in reports)
  'artifacts',

  # Postman/Newman HTML
  'api-postman-newman/newman.html',

  # Cypress outputs
  'ui-cypress/cypress/videos',
  'ui-cypress/cypress/screenshots',
  'ui-cypress/cypress/reports/a11y',

  # Playwright outputs
  'ui-playwright-ts/playwright-report',
  'ui-playwright-ts/playwright-report-a11y',
  'ui-playwright-ts/playwright-report-visual',
  'ui-playwright-ts/a11y-reports',
  'ui-playwright-ts/coverage-unit',

  # Selenium (Maven) targets
  'ui-selenium-java/target',

  # JMeter
  'perf-jmeter/html-report',
  'perf-jmeter/results.jtl',

  # ZAP (if any reports got committed)
  'security-zap-baseline/zap_report'
)

# OS cruft / common log/temp globs (optional)
$fileGlobs = @(
  '*.log', '*.tmp', '*.swp', '*.swo',
  '.DS_Store', 'Thumbs.db'
)

# --- AI/agent files (you said you’ll handle these) ---
# Uncomment & edit if you want to purge them now:
# $aiPaths = @(
#   'AGENTS.md',
#   'AGENT_PROMPTS',
#   '.cursor'
# )
$aiPaths = @()

$allPaths = @()
$allPaths += $artifactPaths
$allPaths += $aiPaths

# Expand & de-dupe
$expanded = New-Object System.Collections.Generic.HashSet[string]
foreach ($p in $allPaths) {
  if ($p -match '[\*\?\[]') {
    # wildcard: expand relative to repo
    Get-ChildItem -Path $p -Force -Recurse -ErrorAction SilentlyContinue |
      ForEach-Object { [void]$expanded.Add($_.FullName) }
  } else {
    $full = Resolve-Path -LiteralPath $p -ErrorAction SilentlyContinue
    if ($full) { [void]$expanded.Add($full.Path) }
  }
}

# Add globbed files
foreach ($g in $fileGlobs) {
  Get-ChildItem -Path . -Filter $g -Force -Recurse -ErrorAction SilentlyContinue |
    ForEach-Object { [void]$expanded.Add($_.FullName) }
}

if ($expanded.Count -eq 0) {
  Info "Nothing to remove. (No matching artifacts found.)"
} else {
  Info "Will remove $($expanded.Count) items:"
  $expanded | Sort-Object | ForEach-Object { Write-Host "  - $_" }

  if ($DryRun) {
    Warn "Dry-run: no files were deleted."
  } else {
    # Delete files/dirs
    $errors = 0
    foreach ($path in ($expanded | Sort-Object -Descending)) {
      try {
        if (Test-Path -LiteralPath $path) {
          Remove-Item -LiteralPath $path -Recurse -Force -ErrorAction Stop
          Write-Host "  deleted: $path" -ForegroundColor DarkGreen
        } else {
          Skip "not found: $path"
        }
      } catch {
        $errors++
        Warn "failed: $path  ($($_.Exception.Message))"
      }
    }
    if ($errors -gt 0) {
      Warn "Completed with $errors delete error(s). Re-run if needed."
    } else {
      Done "All targeted artifacts removed."
    }
  }
}

# Show staged state & optionally commit deletions
Info "Git status after purge:"
git status --porcelain

if (-not $DryRun -and $Commit) {
  Info "Staging deletions..."
  git add -A
  if ((git diff --cached --name-only) -ne $null) {
    git commit -m "chore: purge generated artifacts prior to migration"
    Done "Commit created."
  } else {
    Skip "No changes staged; nothing to commit."
  }
}

Done "Purge script finished."
