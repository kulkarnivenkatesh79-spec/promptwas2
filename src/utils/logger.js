class Logger {
    static instance;
    isDemoMode = false;
    constructor() { }
    static getInstance() {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
    setDemoMode(enabled) {
        this.isDemoMode = enabled;
    }
    formatMessage(level, message) {
        const timestamp = new Date().toISOString();
        return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    }
    info(message) {
        console.info(this.formatMessage('info', message));
    }
    warn(message) {
        console.warn(this.formatMessage('warn', message));
    }
    error(message, error) {
        console.error(this.formatMessage('error', message), error || '');
    }
    debug(message) {
        if (import.meta.env.DEV) {
            console.debug(this.formatMessage('debug', message));
        }
    }
}
export const logger = Logger.getInstance();
//# sourceMappingURL=logger.js.map