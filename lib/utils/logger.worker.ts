// Worker-compatible logger shim using console
// Winston is not compatible with Cloudflare Workers
import { config } from '@/config';

type LogMethod = (message: string, ...meta: unknown[]) => void;

interface Logger {
    error: LogMethod;
    warn: LogMethod;
    info: LogMethod;
    http: LogMethod;
    verbose: LogMethod;
    debug: LogMethod;
    silly: LogMethod;
    log: (level: string, message: string, ...meta: unknown[]) => void;
}

const formatMessage = (level: string, message: string): string => {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] ${level}: ${message}`;
};

// Match Winston's default npm logging levels.
const levels: Record<string, number> = { error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6 };

const writeLog = (level: string, method: 'error' | 'warn' | 'info' | 'debug' | 'log', message: string, ...meta: unknown[]) => {
    // Read config when logging so importing the logger does not depend on config initialization order.
    if (!Object.hasOwn(levels, level) || !Object.hasOwn(levels, config.loggerLevel) || levels[level] > levels[config.loggerLevel]) {
        return;
    }
    // eslint-disable-next-line no-console
    console[method](formatMessage(level, message), ...meta);
};

const logger: Logger = {
    error: (message, ...meta) => writeLog('error', 'error', message, ...meta),
    warn: (message, ...meta) => writeLog('warn', 'warn', message, ...meta),
    info: (message, ...meta) => writeLog('info', 'info', message, ...meta),
    http: (message, ...meta) => writeLog('http', 'log', message, ...meta),
    verbose: (message, ...meta) => writeLog('verbose', 'log', message, ...meta),
    debug: (message, ...meta) => writeLog('debug', 'debug', message, ...meta),
    silly: (message, ...meta) => writeLog('silly', 'log', message, ...meta),
    log: (level, message, ...meta) => writeLog(level, 'log', message, ...meta),
};

export default logger;
