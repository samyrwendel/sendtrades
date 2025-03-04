class Logger {
    constructor() {
        this.logs = [];
        this.maxLogs = 1000;
    }
    createLogEntry(level, message, data) {
        return {
            level,
            message,
            timestamp: new Date().toISOString(),
            data
        };
    }
    addLog(entry) {
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
        console.log(`${consoleStyles[entry.level]}[${entry.level.toUpperCase()}] ${entry.timestamp}${resetColor} - ${entry.message}`, entry.data || '');
    }
    info(message, data) {
        this.addLog(this.createLogEntry('info', message, data));
    }
    warn(message, data) {
        this.addLog(this.createLogEntry('warn', message, data));
    }
    error(message, data) {
        this.addLog(this.createLogEntry('error', message, data));
    }
    debug(message, data) {
        this.addLog(this.createLogEntry('debug', message, data));
    }
    getLogs() {
        return [...this.logs];
    }
    getLogsByLevel(level) {
        return this.logs.filter(log => log.level === level);
    }
    clearLogs() {
        this.logs = [];
    }
}
export const logger = new Logger();
