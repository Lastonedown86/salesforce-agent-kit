import { logger } from '../utils/logger.js';
import { copyAllCategories, hasInstalledSkills, getInstalledCategories } from '../utils/fs.js';

export function updateCommand(): void {
  logger.header('Updating Salesforce Agent Skills');

  if (!hasInstalledSkills()) {
    logger.warning('No skills installed yet');
    logger.info('Run "cloudcrafter-skills init" to install skills first');
    return;
  }

  const installed = getInstalledCategories();
  logger.info(`Found ${installed.length} installed categories`);

  // Force update all installed categories
  const installedNames = installed.map(c => c.name);
  const { copied } = copyAllCategories(true);

  // Only report on categories that were previously installed
  const updated = copied.filter(name => installedNames.includes(name));

  if (updated.length > 0) {
    logger.success(`Updated ${updated.length} categories:`);
    updated.forEach(cat => {
      const category = installed.find(c => c.name === cat);
      if (category) {
        console.log(`     - ${cat} (${category.skills.length} skills)`);
      }
    });
  } else {
    logger.info('All skills are already up to date');
  }
}
