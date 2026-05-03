type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private static instance: Logger;
  private isDemoMode: boolean = false;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  setDemoMode(enabled: boolean) {
    this.isDemoMode = enabled;
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  }

  info(message: string) {
    console.info(this.formatMessage('info', message));
  }

  warn(message: string) {
    console.warn(this.formatMessage('warn', message));
  }

  error(message: string, error?: any) {
    console.error(this.formatMessage('error', message), error || '');
  }

  debug(message: string) {
    if (import.meta.env.DEV) {
      console.debug(this.formatMessage('debug', message));
    }
  }
}

export const logger = Logger.getInstance();
