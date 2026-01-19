---
description: Step-by-step workflows for Salesforce CLI, scratch orgs, and deployment
---

# Deployment & DevOps Workflow

## Prerequisites
- Salesforce CLI (sf) installed
- Dev Hub enabled org
- Git version control

---

## Workflow: Set Up a New SFDX Project

### Step 1: Create Project
```bash
sf project generate --name my-project --template standard
cd my-project
```

### Step 2: Authorize Dev Hub
```bash
sf org login web --set-default-dev-hub --alias DevHub
```

### Step 3: Create Scratch Org
```bash
sf org create scratch --definition-file config/project-scratch-def.json --alias MyScratch --duration-days 7 --set-default
```

### Step 4: Push Source
```bash
sf project deploy start
```

---

## Workflow: Deploy to Production

### Step 1: Validate First
```bash
sf project deploy validate --target-org Production --manifest manifest/package.xml --test-level RunLocalTests
```

### Step 2: Review Validation Results
```bash
sf project deploy report --job-id <jobId>
```

### Step 3: Quick Deploy (After Validation)
```bash
sf project deploy quick --job-id <validationJobId>
```

---

## Workflow: Work with Packages

### Create Unlocked Package
```bash
sf package create --name "My Package" --package-type Unlocked --path force-app --target-dev-hub DevHub
```

### Create Package Version
```bash
sf package version create --package "My Package" --installation-key-bypass --wait 10
```

### Install Package
```bash
sf package install --package 04t... --target-org TargetOrg --wait 10
```

---

## Common Commands Quick Reference

| Task | Command |
|------|---------|
| List orgs | `sf org list` |
| Open org | `sf org open` |
| Run tests | `sf apex run test --test-level RunLocalTests` |
| Retrieve metadata | `sf project retrieve start --manifest manifest/package.xml` |
| Generate package.xml | `sf project generate manifest --from-org` |

---

## Related Skills
- [salesforce-cli.md](../skills/deployment/salesforce-cli.md)
