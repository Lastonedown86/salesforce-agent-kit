# Contributing to Salesforce Agent Kit

Thank you for your interest in contributing! This guide will help you get started.

## Ways to Contribute

- 🐛 **Report bugs** - Open an issue using the bug report template
- ✨ **Request features** - Open an issue using the feature request template
- 📚 **Improve skills** - Add or enhance Salesforce knowledge content
- 🛠️ **Fix bugs** - Submit PRs for existing issues
- 📖 **Improve docs** - Help make our documentation better

## Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/salesforce-agent-kit.git
   cd salesforce-agent-kit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Run tests**
   ```bash
   npm test
   ```

5. **Test CLI locally**
   ```bash
   node dist/index.js --help
   node dist/index.js list
   ```

## Project Structure

```
salesforce-agent-kit/
├── .agent/                  # Skills, agents, and workflows content
│   ├── agents/             # Specialized AI agent personas
│   ├── skills/             # Technical knowledge by category
│   └── workflows/          # Step-by-step development guides
├── src/                    # CLI source code
│   ├── commands/           # CLI command implementations
│   └── utils/              # Utility functions
├── tests/                  # Test files
└── dist/                   # Built output (generated)
```

## Adding a New Skill

1. Create a new `.md` file in the appropriate `.agent/skills/<category>/` folder
2. Use this format:
   ```markdown
   ---
   description: Brief description for AI context
   ---

   # Skill Title

   ## Overview
   Brief introduction to the topic.

   ## Best Practices
   - Practice 1
   - Practice 2

   ## Code Examples

   ```apex
   // Example code with comments
   ```

   ## Common Patterns
   Describe common patterns...

   ## Anti-patterns to Avoid
   - Anti-pattern 1
   - Anti-pattern 2
   ```

3. Update the copilot-instructions.md if adding a new category

## Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system changes
- `ci`: CI/CD changes
- `chore`: Maintenance tasks

**Examples:**
```
feat(apex): add platform events skill
fix(cli): handle missing .agent directory gracefully
docs(readme): add installation troubleshooting section
```

## Pull Request Process

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make your changes** following our coding standards

3. **Run tests** to ensure everything works:
   ```bash
   npm test
   ```

4. **Commit your changes** using conventional commit format

5. **Push to your fork** and create a Pull Request

6. **Fill out the PR template** completely

7. **Wait for review** - maintainers will review and provide feedback

## Code Standards

- Use TypeScript for CLI code
- Use Markdown for skill and workflow content
- Include code examples in skills
- Add comments explaining complex patterns
- Follow Salesforce naming conventions in examples

## Questions?

Feel free to open an issue if you have questions or need help getting started!
