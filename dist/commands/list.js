import { logger } from '../utils/logger.js';
import { getAvailableCategories, getInstalledCategories, getAvailableAgents, getInstalledAgents } from '../utils/fs.js';
export function listCommand(options) {
    logger.header('Salesforce Agent Kit');
    const available = getAvailableCategories();
    const installed = getInstalledCategories();
    const installedNames = new Set(installed.map(c => c.name));
    // Show skills
    console.log('Skill Categories:\n');
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
    console.log(`  Skills: ${available.length} categories, ${totalSkills} skills (${installedSkills} installed)`);
    // Show agents
    const availableAgents = getAvailableAgents();
    const installedAgentsArr = getInstalledAgents();
    const installedAgentNames = new Set(installedAgentsArr.map(a => a.name));
    if (availableAgents.length > 0) {
        console.log();
        console.log('Specialized Agents:\n');
        for (const agent of availableAgents) {
            const isInstalled = installedAgentNames.has(agent.name);
            const status = isInstalled ? ' ✓' : '';
            console.log(`  🤖 ${agent.name}${status}`);
        }
        console.log();
        console.log(`  Agents: ${availableAgents.length} available (${installedAgentsArr.length} installed)`);
    }
    console.log();
    if (!options.verbose) {
        logger.info('Use --verbose to see individual skills');
    }
}
//# sourceMappingURL=list.js.map