import { existsSync, mkdirSync, cpSync, readdirSync, rmSync, statSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

// Get the package root directory with fallback detection
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function findPackageRoot(): string {
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

export const SKILLS_TARGET = join(process.cwd(), '.agent', 'skills');
export const AGENTS_TARGET = join(process.cwd(), '.agent', 'agents');

export interface SkillCategory {
  name: string;
  path: string;
  skills: string[];
}

/**
 * Get all available skill categories from the package
 */
export function getAvailableCategories(): SkillCategory[] {
  if (!existsSync(SKILLS_SOURCE)) {
    return [];
  }

  const categories: SkillCategory[] = [];
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
export function getInstalledCategories(): SkillCategory[] {
  if (!existsSync(SKILLS_TARGET)) {
    return [];
  }

  const categories: SkillCategory[] = [];
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
export function copyCategory(categoryName: string, force: boolean = false): boolean {
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
export function copyAllCategories(force: boolean = false): { copied: string[]; skipped: string[] } {
  const categories = getAvailableCategories();
  const copied: string[] = [];
  const skipped: string[] = [];

  // Ensure base directory exists
  mkdirSync(SKILLS_TARGET, { recursive: true });

  for (const category of categories) {
    if (copyCategory(category.name, force)) {
      copied.push(category.name);
    } else {
      skipped.push(category.name);
    }
  }

  return { copied, skipped };
}

/**
 * Remove a category from the project
 */
export function removeCategory(categoryName: string): boolean {
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
export function hasInstalledSkills(): boolean {
  return existsSync(SKILLS_TARGET) && readdirSync(SKILLS_TARGET).length > 0;
}

// ============================================
// Agent Functions
// ============================================

export interface Agent {
  name: string;
  path: string;
  description?: string;
}

/**
 * Get all available agents from the package
 */
export function getAvailableAgents(): Agent[] {
  if (!existsSync(AGENTS_SOURCE)) {
    return [];
  }

  const agents: Agent[] = [];
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
export function getInstalledAgents(): Agent[] {
  if (!existsSync(AGENTS_TARGET)) {
    return [];
  }

  const agents: Agent[] = [];
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
export function copyAgent(agentName: string, force: boolean = false): boolean {
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
export function copyAllAgents(force: boolean = false): { copied: string[]; skipped: string[] } {
  const agents = getAvailableAgents();
  const copied: string[] = [];
  const skipped: string[] = [];

  // Ensure base directory exists
  mkdirSync(AGENTS_TARGET, { recursive: true });

  for (const agent of agents) {
    if (copyAgent(agent.name, force)) {
      copied.push(agent.name);
    } else {
      skipped.push(agent.name);
    }
  }

  return { copied, skipped };
}

/**
 * Remove an agent from the project
 */
export function removeAgent(agentName: string): boolean {
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
export function hasInstalledAgents(): boolean {
  return existsSync(AGENTS_TARGET) && readdirSync(AGENTS_TARGET).filter(f => f.endsWith('.md')).length > 0;
}
