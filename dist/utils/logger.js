import chalk from 'chalk';
export const logger = {
    info: (message) => console.log(chalk.blue('ℹ'), message),
    success: (message) => console.log(chalk.green('✓'), message),
    warning: (message) => console.log(chalk.yellow('⚠'), message),
    error: (message) => console.log(chalk.red('✗'), message),
    header: (message) => {
        console.log();
        console.log(chalk.bold.cyan('═'.repeat(50)));
        console.log(chalk.bold.cyan(`  ${message}`));
        console.log(chalk.bold.cyan('═'.repeat(50)));
        console.log();
    },
    category: (name, count) => {
        console.log(chalk.bold.white(`  📁 ${name}`) + chalk.gray(` (${count} skills)`));
    },
    skill: (name) => {
        console.log(chalk.gray(`     └─ ${name}`));
    }
};
//# sourceMappingURL=logger.js.map