import { logger } from '../utils/logger.js';
import { copyAllCategories, getAvailableCategories, SKILLS_TARGET } from '../utils/fs.js';

interface InitOptions {
  force?: boolean;
}

export function initCommand(options: InitOptions): void {
  logger.header('Initializing Salesforce Agent Skills');

  const categories = getAvailableCategories();
  
  if (categories.length === 0) {
    logger.error('No skill categories found in package');
    process.exit(1);
  }

  logger.info(`Found ${categories.length} skill categories`);
  
  const { copied, skipped } = copyAllCategories(options.force || false);

  if (copied.length > 0) {
    logger.success(`Installed ${copied.length} categories:`);
    copied.forEach(cat => logger.category(cat, categories.find(c => c.name === cat)?.skills.length || 0));
  }

  if (skipped.length > 0 && !options.force) {
    logger.warning(`Skipped ${skipped.length} existing categories (use --force to overwrite):`);
    skipped.forEach(cat => console.log(`     - ${cat}`));
  }

  console.log();
  logger.success(`Skills installed to: ${SKILLS_TARGET}`);
  logger.info('Your AI assistant can now use these skills for Salesforce development!');
}
