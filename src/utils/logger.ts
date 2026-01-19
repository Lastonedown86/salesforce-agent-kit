import chalk from 'chalk';

export const logger = {
  info: (message: string) => console.log(chalk.blue('ℹ'), message),
  success: (message: string) => console.log(chalk.green('✓'), message),
  warning: (message: string) => console.log(chalk.yellow('⚠'), message),
  error: (message: string) => console.log(chalk.red('✗'), message),
  
  header: (message: string) => {
    console.log();
    console.log(chalk.bold.cyan('═'.repeat(50)));
    console.log(chalk.bold.cyan(`  ${message}`));
    console.log(chalk.bold.cyan('═'.repeat(50)));
    console.log();
  },

  category: (name: string, count: number) => {
    console.log(chalk.bold.white(`  📁 ${name}`) + chalk.gray(` (${count} skills)`));
  },

  skill: (name: string) => {
    console.log(chalk.gray(`     └─ ${name}`));
  }
};
