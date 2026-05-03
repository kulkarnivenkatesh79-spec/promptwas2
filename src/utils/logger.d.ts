declare class Logger {
    private static instance;
    private isDemoMode;
    private constructor();
    static getInstance(): Logger;
    setDemoMode(enabled: boolean): void;
    private formatMessage;
    info(message: string): void;
    warn(message: string): void;
    error(message: string, error?: any): void;
    debug(message: string): void;
}
export declare const logger: Logger;
export {};
//# sourceMappingURL=logger.d.ts.map