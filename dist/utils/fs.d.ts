export declare const SKILLS_TARGET: string;
export interface SkillCategory {
    name: string;
    path: string;
    skills: string[];
}
/**
 * Get all available skill categories from the package
 */
export declare function getAvailableCategories(): SkillCategory[];
/**
 * Get installed skill categories from the project
 */
export declare function getInstalledCategories(): SkillCategory[];
/**
 * Copy a category from package to project
 */
export declare function copyCategory(categoryName: string, force?: boolean): boolean;
/**
 * Copy all categories from package to project
 */
export declare function copyAllCategories(force?: boolean): {
    copied: string[];
    skipped: string[];
};
/**
 * Remove a category from the project
 */
export declare function removeCategory(categoryName: string): boolean;
/**
 * Check if skills are installed
 */
export declare function hasInstalledSkills(): boolean;
//# sourceMappingURL=fs.d.ts.map