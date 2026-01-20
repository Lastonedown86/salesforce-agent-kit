import { existsSync, mkdirSync, cpSync, readdirSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
// Get the package root directory with fallback detection
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
function findPackageRoot() {
    // Try standard path (./dist/utils/fs.js -> ../../)
    let root = join(__dirname, '..', '..');
    if (existsSync(join(root, '.agent', 'skills')) && existsSync(join(root, 'package.json'))) {
        return root;
    }
    // Fallback: traverse up to find package.json with our name
    let current = __dirname;
    for (let i = 0; i < 5; i++) {
        if (existsSync(join(current, '.agent', 'skills')) && existsSync(join(current, 'package.json'))) {
            return current;
        }
        current = dirname(current);
    }
    // Last resort: return original calculation
    return join(__dirname, '..', '..');
}
const PACKAGE_ROOT = findPackageRoot();
const SKILLS_SOURCE = join(PACKAGE_ROOT, '.agent', 'skills');
const AGENTS_SOURCE = join(PACKAGE_ROOT, '.agent', 'agents');
const WORKFLOWS_SOURCE = join(PACKAGE_ROOT, '.agent', 'workflows');
export const SKILLS_TARGET = join(process.cwd(), '.agent', 'skills');
export const AGENTS_TARGET = join(process.cwd(), '.agent', 'agents');
export const WORKFLOWS_TARGET = join(process.cwd(), '.agent', 'workflows');
/**
 * Get all available skill categories from the package
 */
export function getAvailableCategories() {
    if (!existsSync(SKILLS_SOURCE)) {
        return [];
    }
    const categories = [];
    const entries = readdirSync(SKILLS_SOURCE, { withFileTypes: true });
    for (const entry of entries) {
        if (entry.isDirectory()) {
            const categoryPath = join(SKILLS_SOURCE, entry.name);
            const skills = readdirSync(categoryPath)
                .filter(file => file.endsWith('.md'))
                .map(file => file.replace('.md', ''));
            categories.push({
                name: entry.name,
                path: categoryPath,
                skills
            });
        }
    }
    return categories;
}
/**
 * Get installed skill categories from the project
 */
export function getInstalledCategories() {
    if (!existsSync(SKILLS_TARGET)) {
        return [];
    }
    const categories = [];
    const entries = readdirSync(SKILLS_TARGET, { withFileTypes: true });
    for (const entry of entries) {
        if (entry.isDirectory()) {
            const categoryPath = join(SKILLS_TARGET, entry.name);
            const skills = readdirSync(categoryPath)
                .filter(file => file.endsWith('.md'))
                .map(file => file.replace('.md', ''));
            categories.push({
                name: entry.name,
                path: categoryPath,
                skills
            });
        }
    }
    return categories;
}
/**
 * Copy a category from package to project
 */
export function copyCategory(categoryName, force = false) {
    const sourcePath = join(SKILLS_SOURCE, categoryName);
    const targetPath = join(SKILLS_TARGET, categoryName);
    if (!existsSync(sourcePath)) {
        return false;
    }
    if (existsSync(targetPath) && !force) {
        return false;
    }
    // Ensure target directory exists
    mkdirSync(targetPath, { recursive: true });
    // Copy all files
    cpSync(sourcePath, targetPath, { recursive: true });
    return true;
}
/**
 * Copy all categories from package to project
 */
export function copyAllCategories(force = false) {
    const categories = getAvailableCategories();
    const copied = [];
    const skipped = [];
    // Ensure base directory exists
    mkdirSync(SKILLS_TARGET, { recursive: true });
    for (const category of categories) {
        if (copyCategory(category.name, force)) {
            copied.push(category.name);
        }
        else {
            skipped.push(category.name);
        }
    }
    return { copied, skipped };
}
/**
 * Remove a category from the project
 */
export function removeCategory(categoryName) {
    const targetPath = join(SKILLS_TARGET, categoryName);
    if (!existsSync(targetPath)) {
        return false;
    }
    rmSync(targetPath, { recursive: true, force: true });
    return true;
}
/**
 * Check if skills are installed
 */
export function hasInstalledSkills() {
    return existsSync(SKILLS_TARGET) && readdirSync(SKILLS_TARGET).length > 0;
}
/**
 * Get all available agents from the package
 */
export function getAvailableAgents() {
    if (!existsSync(AGENTS_SOURCE)) {
        return [];
    }
    const agents = [];
    const entries = readdirSync(AGENTS_SOURCE);
    for (const file of entries) {
        if (file.endsWith('.md')) {
            agents.push({
                name: file.replace('.md', ''),
                path: join(AGENTS_SOURCE, file)
            });
        }
    }
    return agents;
}
/**
 * Get installed agents from the project
 */
export function getInstalledAgents() {
    if (!existsSync(AGENTS_TARGET)) {
        return [];
    }
    const agents = [];
    const entries = readdirSync(AGENTS_TARGET);
    for (const file of entries) {
        if (file.endsWith('.md')) {
            agents.push({
                name: file.replace('.md', ''),
                path: join(AGENTS_TARGET, file)
            });
        }
    }
    return agents;
}
/**
 * Copy a single agent from package to project
 */
export function copyAgent(agentName, force = false) {
    const sourcePath = join(AGENTS_SOURCE, `${agentName}.md`);
    const targetPath = join(AGENTS_TARGET, `${agentName}.md`);
    if (!existsSync(sourcePath)) {
        return false;
    }
    if (existsSync(targetPath) && !force) {
        return false;
    }
    // Ensure target directory exists
    mkdirSync(AGENTS_TARGET, { recursive: true });
    // Copy the agent file
    cpSync(sourcePath, targetPath);
    return true;
}
/**
 * Copy all agents from package to project
 */
export function copyAllAgents(force = false) {
    const agents = getAvailableAgents();
    const copied = [];
    const skipped = [];
    // Ensure base directory exists
    mkdirSync(AGENTS_TARGET, { recursive: true });
    for (const agent of agents) {
        if (copyAgent(agent.name, force)) {
            copied.push(agent.name);
        }
        else {
            skipped.push(agent.name);
        }
    }
    return { copied, skipped };
}
/**
 * Remove an agent from the project
 */
export function removeAgent(agentName) {
    const targetPath = join(AGENTS_TARGET, `${agentName}.md`);
    if (!existsSync(targetPath)) {
        return false;
    }
    rmSync(targetPath, { force: true });
    return true;
}
/**
 * Check if agents are installed
 */
export function hasInstalledAgents() {
    return existsSync(AGENTS_TARGET) && readdirSync(AGENTS_TARGET).filter(f => f.endsWith('.md')).length > 0;
}
/**
 * Get all available workflows from the package
 */
export function getAvailableWorkflows() {
    if (!existsSync(WORKFLOWS_SOURCE)) {
        return [];
    }
    const workflows = [];
    const entries = readdirSync(WORKFLOWS_SOURCE);
    for (const file of entries) {
        if (file.endsWith('.md')) {
            workflows.push({
                name: file.replace('.md', ''),
                path: join(WORKFLOWS_SOURCE, file)
            });
        }
    }
    return workflows;
}
/**
 * Get installed workflows from the project
 */
export function getInstalledWorkflows() {
    if (!existsSync(WORKFLOWS_TARGET)) {
        return [];
    }
    const workflows = [];
    const entries = readdirSync(WORKFLOWS_TARGET);
    for (const file of entries) {
        if (file.endsWith('.md')) {
            workflows.push({
                name: file.replace('.md', ''),
                path: join(WORKFLOWS_TARGET, file)
            });
        }
    }
    return workflows;
}
/**
 * Copy a single workflow from package to project
 */
export function copyWorkflow(workflowName, force = false) {
    const sourcePath = join(WORKFLOWS_SOURCE, `${workflowName}.md`);
    const targetPath = join(WORKFLOWS_TARGET, `${workflowName}.md`);
    if (!existsSync(sourcePath)) {
        return false;
    }
    if (existsSync(targetPath) && !force) {
        return false;
    }
    // Ensure target directory exists
    mkdirSync(WORKFLOWS_TARGET, { recursive: true });
    // Copy the workflow file
    cpSync(sourcePath, targetPath);
    return true;
}
/**
 * Copy all workflows from package to project
 */
export function copyAllWorkflows(force = false) {
    const workflows = getAvailableWorkflows();
    const copied = [];
    const skipped = [];
    // Ensure base directory exists
    mkdirSync(WORKFLOWS_TARGET, { recursive: true });
    for (const workflow of workflows) {
        if (copyWorkflow(workflow.name, force)) {
            copied.push(workflow.name);
        }
        else {
            skipped.push(workflow.name);
        }
    }
    return { copied, skipped };
}
/**
 * Remove a workflow from the project
 */
export function removeWorkflow(workflowName) {
    const targetPath = join(WORKFLOWS_TARGET, `${workflowName}.md`);
    if (!existsSync(targetPath)) {
        return false;
    }
    rmSync(targetPath, { force: true });
    return true;
}
/**
 * Check if workflows are installed
 */
export function hasInstalledWorkflows() {
    return existsSync(WORKFLOWS_TARGET) && readdirSync(WORKFLOWS_TARGET).filter(f => f.endsWith('.md')).length > 0;
}
//# sourceMappingURL=fs.js.map