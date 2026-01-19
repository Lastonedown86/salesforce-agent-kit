import { logger } from '../utils/logger.js';
import { removeCategory, getInstalledCategories } from '../utils/fs.js';

export function removeCommand(category: string): void {
  logger.header(`Removing ${category} Skills`);

  const installed = getInstalledCategories();
  const targetCategory = installed.find(c => c.name === category);

  if (!targetCategory) {
    logger.error(`Category "${category}" is not installed`);
    
    if (installed.length > 0) {
      console.log();
      logger.info('Installed categories:');
      installed.forEach(cat => console.log(`  - ${cat.name}`));
    }
    process.exit(1);
  }

  const success = removeCategory(category);

  if (success) {
    logger.success(`Removed ${category} category (${targetCategory.skills.length} skills)`);
  } else {
    logger.error(`Failed to remove ${category}`);
  }
}
