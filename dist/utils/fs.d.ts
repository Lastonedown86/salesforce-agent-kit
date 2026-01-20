export declare const SKILLS_TARGET: string;
export declare const AGENTS_TARGET: string;
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
export interface Agent {
    name: string;
    path: string;
    description?: string;
}
/**
 * Get all available agents from the package
 */
export declare function getAvailableAgents(): Agent[];
/**
 * Get installed agents from the project
 */
export declare function getInstalledAgents(): Agent[];
/**
 * Copy a single agent from package to project
 */
export declare function copyAgent(agentName: string, force?: boolean): boolean;
/**
 * Copy all agents from package to project
 */
export declare function copyAllAgents(force?: boolean): {
    copied: string[];
    skipped: string[];
};
/**
 * Remove an agent from the project
 */
export declare function removeAgent(agentName: string): boolean;
/**
 * Check if agents are installed
 */
export declare function hasInstalledAgents(): boolean;
//# sourceMappingURL=fs.d.ts.map