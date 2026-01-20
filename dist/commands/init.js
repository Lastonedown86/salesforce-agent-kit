import { logger } from '../utils/logger.js';
import { copyAllCategories, getAvailableCategories, SKILLS_TARGET, copyAllAgents, getAvailableAgents, AGENTS_TARGET } from '../utils/fs.js';
export function initCommand(options) {
    logger.header('Initializing Salesforce Agent Kit');
    const categories = getAvailableCategories();
    const agents = getAvailableAgents();
    if (categories.length === 0 && agents.length === 0) {
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
    console.log();
    logger.success(`Skills installed to: ${SKILLS_TARGET}`);
    if (agents.length > 0) {
        logger.success(`Agents installed to: ${AGENTS_TARGET}`);
    }
    logger.info('Your AI assistant can now use these skills for Salesforce development!');
}
//# sourceMappingURL=init.js.map