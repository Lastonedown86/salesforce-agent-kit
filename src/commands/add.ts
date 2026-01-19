import { logger } from '../utils/logger.js';
import { copyCategory, getAvailableCategories, SKILLS_TARGET } from '../utils/fs.js';

interface AddOptions {
  force?: boolean;
}

export function addCommand(category: string, options: AddOptions): void {
  logger.header(`Adding ${category} Skills`);

  const categories = getAvailableCategories();
  const targetCategory = categories.find(c => c.name === category);

  if (!targetCategory) {
    logger.error(`Category "${category}" not found`);
    console.log();
    logger.info('Available categories:');
    categories.forEach(cat => console.log(`  - ${cat.name}`));
    process.exit(1);
  }

  const success = copyCategory(category, options.force || false);

  if (success) {
    logger.success(`Installed ${category} category with ${targetCategory.skills.length} skills:`);
    targetCategory.skills.forEach(skill => logger.skill(skill));
    console.log();
    logger.info(`Skills installed to: ${SKILLS_TARGET}/${category}`);
  } else {
    logger.warning(`Category "${category}" already exists (use --force to overwrite)`);
  }
}
