
import chalk from 'chalk';

export class Logger {
  private static getTimestamp(): string {
    return new Date().toLocaleString();
  }

  static info(message: string): void {
    console.log(chalk.blue(`[${this.getTimestamp()}] [INFO] ${message}`));
  }

  static success(message: string): void {
    console.log(chalk.green(`[${this.getTimestamp()}] [SUCCESS] ${message}`));
  }

  static warn(message: string): void {
    console.log(chalk.yellow(`[${this.getTimestamp()}] [WARN] ${message}`));
  }

  static error(message: string): void {
    console.log(chalk.red(`[${this.getTimestamp()}] [ERROR] ${message}`));
  }

  static debug(message: string): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(chalk.gray(`[${this.getTimestamp()}] [DEBUG] ${message}`));
    }
  }

  static command(user: string, command: string, guild?: string): void {
    const location = guild ? `in ${guild}` : 'in DMs';
    console.log(chalk.cyan(`[${this.getTimestamp()}] [COMMAND] ${user} used ${command} ${location}`));
  }
}