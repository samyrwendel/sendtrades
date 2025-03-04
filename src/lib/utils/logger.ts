type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: unknown;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  private createLogEntry(level: LogLevel, message: string, data?: unknown): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      data
    };
  }

  private addLog(entry: LogEntry): void {
    this.logs.push(entry);
    
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    const consoleStyles = {
      info: '\x1b[34m',
      warn: '\x1b[33m',
      error: '\x1b[31m',
      debug: '\x1b[90m'
    };

    const resetColor = '\x1b[0m';
    console.log(
      `${consoleStyles[entry.level]}[${entry.level.toUpperCase()}] ${entry.timestamp}${resetColor} - ${entry.message}`,
      entry.data || ''
    );
  }

  info(message: string, data?: unknown): void {
    this.addLog(this.createLogEntry('info', message, data));
  }

  warn(message: string, data?: unknown): void {
    this.addLog(this.createLogEntry('warn', message, data));
  }

  error(message: string, data?: unknown): void {
    this.addLog(this.createLogEntry('error', message, data));
  }

  debug(message: string, data?: unknown): void {
    this.addLog(this.createLogEntry('debug', message, data));
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  clearLogs(): void {
    this.logs = [];
  }
}

export const logger = new Logger(); 