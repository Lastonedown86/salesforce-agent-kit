import { logger } from '../utils/logger.js';
import { getAvailableCategories, getInstalledCategories } from '../utils/fs.js';

interface ListOptions {
  verbose?: boolean;
}

export function listCommand(options: ListOptions): void {
  logger.header('Salesforce Agent Skills');

  const available = getAvailableCategories();
  const installed = getInstalledCategories();
  const installedNames = new Set(installed.map(c => c.name));

  console.log('Available categories:\n');

  for (const category of available) {
    const isInstalled = installedNames.has(category.name);
    const status = isInstalled ? ' ✓' : '';
    
    logger.category(category.name + status, category.skills.length);

    if (options.verbose) {
      category.skills.forEach(skill => logger.skill(skill));
    }
  }

  const totalSkills = available.reduce((sum, cat) => sum + cat.skills.length, 0);
  const installedSkills = installed.reduce((sum, cat) => sum + cat.skills.length, 0);

  console.log();
  console.log(`  Total: ${available.length} categories, ${totalSkills} skills`);
  console.log(`  Installed: ${installed.length} categories, ${installedSkills} skills`);
  console.log();

  if (!options.verbose) {
    logger.info('Use --verbose to see individual skills');
  }
}
