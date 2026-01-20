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
export const SKILLS_TARGET = join(process.cwd(), '.agent', 'skills');
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
//# sourceMappingURL=fs.js.map