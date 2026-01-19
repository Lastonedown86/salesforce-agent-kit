---
description: Salesforce CLI workflows for development
---

# Salesforce CLI Workflows

Essential SF CLI commands for development workflows.

## Project Setup

```bash
# Create new project
sf project generate --name myproject --template standard

# Clone from git and initialize
git clone https://github.com/org/repo.git
cd repo
sf org login web --alias mydevhub --set-default-dev-hub
```

## Scratch Org Workflow

```bash
# Create scratch org
sf org create scratch \
  --definition-file config/project-scratch-def.json \
  --alias myscratch \
  --duration-days 7 \
  --set-default

# Push metadata to scratch org
sf project deploy start --source-dir force-app

# Pull changes from scratch org
sf project retrieve start --source-dir force-app

# Open scratch org
sf org open

# List scratch orgs
sf org list --all

# Delete scratch org
sf org delete scratch --target-org myscratch --no-prompt
```

## Sandbox Workflow

```bash
# Login to sandbox
sf org login web --alias mysandbox --instance-url https://test.salesforce.com

# Deploy to sandbox
sf project deploy start \
  --source-dir force-app \
  --target-org mysandbox \
  --wait 30

# Quick deploy (after validation)
sf project deploy quick --job-id <jobId>

# Retrieve from sandbox
sf project retrieve start \
  --target-org mysandbox \
  --manifest manifest/package.xml
```

## Run Tests

```bash
# Run all tests
sf apex run test --target-org myscratch --wait 10

# Run specific test class
sf apex run test \
  --class-names MyTestClass \
  --result-format human \
  --code-coverage \
  --wait 10

# Run specific test methods
sf apex run test \
  --tests MyTestClass.testMethod1,MyTestClass.testMethod2

# Output results to directory
sf apex run test \
  --output-dir test-results \
  --result-format json
```

## Data Management

```bash
# Export data
sf data export tree \
  --query "SELECT Id, Name FROM Account LIMIT 10" \
  --output-dir data/accounts

# Import data
sf data import tree --files data/accounts/Account.json

# Execute SOQL
sf data query --query "SELECT Id, Name FROM Account LIMIT 5"

# Execute anonymous Apex
sf apex run --file scripts/apex/myScript.apex
```

## Useful Flags

| Flag | Description |
|------|-------------|
| `--json` | Output in JSON format |
| `--wait` | Wait for async operations |
| `--target-org` | Specify org alias |
| `--dry-run` | Preview without executing |
| `--verbose` | Detailed output |

## Aliases for Common Commands

Add to shell profile (`.bashrc`, `.zshrc`):

```bash
alias sfdx="sf"
alias sfpush="sf project deploy start --source-dir force-app"
alias sfpull="sf project retrieve start --source-dir force-app"
alias sftest="sf apex run test --wait 10 --code-coverage"
alias sfopen="sf org open"
```

## Best Practices

1. **Use aliases** - For org management
2. **Set default org** - `sf config set target-org=alias`
3. **Validate before deploy** - Use `--dry-run` flag
4. **Check test coverage** - Deploy with `--test-level`
5. **Use manifest files** - For selective deployment
