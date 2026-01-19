# @cloudcrafter/salesforce-agent-kit

> AI agent kit for Salesforce development - skills, workflows, patterns and automation for Apex, LWC, Triggers, and more.

[![npm version](https://badge.fury.io/js/@cloudcrafter%2Fsalesforce-agent-kit.svg)](https://www.npmjs.com/package/@cloudcrafter/salesforce-agent-kit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## What is this?

This CLI package provides AI coding assistants with Salesforce-specific knowledge through a collection of **skill files** and **workflow guides**. When installed in your project, these help AI assistants understand Salesforce patterns, best practices, and common solutions.

- **Skills**: Reference knowledge about patterns and best practices
- **Workflows**: Step-by-step guidance for common development tasks

## Quick Start

```bash
# Initialize all skills and workflows in your project
npx @cloudcrafter/salesforce-agent-kit init

# Or add specific categories
npx @cloudcrafter/salesforce-agent-kit add apex
npx @cloudcrafter/salesforce-agent-kit add triggers
```

## Available Skills

| Category | Skills | Description |
|----------|--------|-------------|
| `apex` | 4 | Batch, Queueable, Governor Limits, Error Handling |
| `triggers` | 5 | Handler Framework, Recursion, Context, Bulkification |
| `lwc` | 4 | Architecture, Wire, Events, Imperative Apex |
| `soql` | 3 | Optimization, Relationships, Dynamic SOQL |
| `flows` | 2 | Design Patterns, Record-Triggered |
| `security` | 2 | CRUD/FLS, Sharing Rules |
| `data-modeling` | 1 | Relationships |
| `testing` | 1 | Test Data Factory |
| `deployment` | 1 | Salesforce CLI |
| `integrations` | 1 | REST API |
| `migration` | 5 | VF to LWC, Aura to LWC, JS Button Replacement |

## Available Workflows

Step-by-step guides for common Salesforce development tasks:

| Workflow | Description |
|----------|-------------|
| `apex-development` | Apex classes, Batch, Queueable, async patterns |
| `lwc-development` | Lightning Web Components from scratch |
| `triggers-automation` | Trigger handler framework and best practices |
| `data-modeling` | Custom objects, fields, relationships |
| `soql-optimization` | Query performance and optimization |
| `security-sharing` | CRUD/FLS, sharing rules, permissions |
| `testing-quality` | Test classes, data factories, coverage |
| `deployment-devops` | SFDX, scratch orgs, CI/CD |
| `integrations` | REST callouts, Named Credentials |
| `flows-automation` | Record-triggered and screen flows |
| `classic-to-lightning` | VF→LWC, Aura→LWC migration |

## Commands

### `init`
Initialize all skills and workflows in your project:
```bash
npx @cloudcrafter/salesforce-agent-kit init
npx @cloudcrafter/salesforce-agent-kit init --force  # Overwrite existing
```

### `add <category>`
Add a specific category:
```bash
npx @cloudcrafter/salesforce-agent-kit add apex
npx @cloudcrafter/salesforce-agent-kit add lwc --force
```

### `list`
Show available categories and installed status:
```bash
npx @cloudcrafter/salesforce-agent-kit list
npx @cloudcrafter/salesforce-agent-kit list --verbose  # Show individual skills
```

### `update`
Update installed skills to the latest version:
```bash
npx @cloudcrafter/salesforce-agent-kit update
```

### `remove <category>`
Remove an installed category:
```bash
npx @cloudcrafter/salesforce-agent-kit remove apex
```

## How It Works

Skills and workflows are installed to `.agent/` in your project root. AI coding assistants that support these files will automatically read them to enhance their Salesforce knowledge.

```
your-project/
├── .agent/
│   ├── skills/
│   │   ├── apex/
│   │   │   ├── batch-apex.md
│   │   │   ├── queueable-apex.md
│   │   │   └── ...
│   │   ├── triggers/
│   │   └── ...
│   └── workflows/
│       ├── apex-development.md
│       ├── lwc-development.md
│       └── ...
└── force-app/
```

## File Format

Each skill and workflow file uses a simple format:

```markdown
---
description: Brief description for AI context
---

# Title

Content with code examples, patterns, and best practices...
```

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT © cloudcrafter
