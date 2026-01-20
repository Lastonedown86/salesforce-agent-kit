import { logger } from '../utils/logger.js';
import { copyAllCategories, getAvailableCategories, SKILLS_TARGET, copyAllAgents, getAvailableAgents, AGENTS_TARGET, copyAllWorkflows, getAvailableWorkflows, WORKFLOWS_TARGET } from '../utils/fs.js';

interface InitOptions {
  force?: boolean;
}

export function initCommand(options: InitOptions): void {
  logger.header('Initializing Salesforce Agent Kit');

  const categories = getAvailableCategories();
  const agents = getAvailableAgents();
  const workflows = getAvailableWorkflows();
  
  if (categories.length === 0 && agents.length === 0 && workflows.length === 0) {
    logger.error('No skills or agents found in package');
    process.exit(1);
  }

  // Install skills
  if (categories.length > 0) {
    logger.info(`Found ${categories.length} skill categories`);
    
    const { copied, skipped } = copyAllCategories(options.force || false);

    if (copied.length > 0) {
      logger.success(`Installed ${copied.length} skill categories:`);
      copied.forEach(cat => logger.category(cat, categories.find(c => c.name === cat)?.skills.length || 0));
    }

    if (skipped.length > 0 && !options.force) {
      logger.warning(`Skipped ${skipped.length} existing categories (use --force to overwrite):`);
      skipped.forEach(cat => console.log(`     - ${cat}`));
    }
  }

  // Install agents
  if (agents.length > 0) {
    console.log();
    logger.info(`Found ${agents.length} specialized agents`);
    
    const { copied: agentsCopied, skipped: agentsSkipped } = copyAllAgents(options.force || false);

    if (agentsCopied.length > 0) {
      logger.success(`Installed ${agentsCopied.length} agents:`);
      agentsCopied.forEach(agent => console.log(`     🤖 ${agent}`));
    }

    if (agentsSkipped.length > 0 && !options.force) {
      logger.warning(`Skipped ${agentsSkipped.length} existing agents (use --force to overwrite):`);
      agentsSkipped.forEach(agent => console.log(`     - ${agent}`));
    }
  }

  // Install workflows
  if (workflows.length > 0) {
    console.log();
    logger.info(`Found ${workflows.length} workflows`);
    
    const { copied: workflowsCopied, skipped: workflowsSkipped } = copyAllWorkflows(options.force || false);

    if (workflowsCopied.length > 0) {
      logger.success(`Installed ${workflowsCopied.length} workflows:`);
      workflowsCopied.forEach(wf => console.log(`     📋 ${wf}`));
    }

    if (workflowsSkipped.length > 0 && !options.force) {
      logger.warning(`Skipped ${workflowsSkipped.length} existing workflows (use --force to overwrite):`);
      workflowsSkipped.forEach(wf => console.log(`     - ${wf}`));
    }
  }

  console.log();
  logger.success(`Skills installed to: ${SKILLS_TARGET}`);
  if (agents.length > 0) {
    logger.success(`Agents installed to: ${AGENTS_TARGET}`);
  }
  if (workflows.length > 0) {
    logger.success(`Workflows installed to: ${WORKFLOWS_TARGET}`);
  }
  logger.info('Your AI assistant can now use these skills for Salesforce development!');
}
