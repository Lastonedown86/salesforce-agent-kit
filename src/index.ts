#!/usr/bin/env node

import { Command } from 'commander';
import { initCommand } from './commands/init.js';
import { addCommand } from './commands/add.js';
import { listCommand } from './commands/list.js';
import { updateCommand } from './commands/update.js';
import { removeCommand } from './commands/remove.js';
import { createRequire } from 'module';

// Dynamically read version from package.json
const require = createRequire(import.meta.url);
const packageJson = require('../package.json');

const program = new Command();

program
  .name('cloudcrafter-skills')
  .description('AI agent skills for Salesforce development')
  .version(packageJson.version);

program
  .command('init')
  .description('Initialize .agent/skills/ folder with all Salesforce skills')
  .option('-f, --force', 'Overwrite existing skills')
  .action(initCommand);

program
  .command('add <category>')
  .description('Add skills from a specific category (e.g., apex, lwc, triggers)')
  .option('-f, --force', 'Overwrite existing skills')
  .action(addCommand);

program
  .command('list')
  .description('Show all available skill categories and skills')
  .option('-v, --verbose', 'Show detailed skill information')
  .action(listCommand);

program
  .command('update')
  .description('Update installed skills to the latest version')
  .action(updateCommand);

program
  .command('remove <category>')
  .description('Remove a skill category')
  .action(removeCommand);

program.parse();
