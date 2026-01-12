// Worker-compatible logger shim using console
// Winston is not compatible with Cloudflare Workers
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface LogInfo {
    level: string;
    message: string;
    timestamp?: string;
    [key: string]: unknown;
}

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

const logger: Logger = {
    error: (message: string, ...meta: unknown[]) => {
        // eslint-disable-next-line no-console
        console.error(formatMessage('error', message), ...meta);
    },
    warn: (message: string, ...meta: unknown[]) => {
        // eslint-disable-next-line no-console
        console.warn(formatMessage('warn', message), ...meta);
    },
    info: (message: string, ...meta: unknown[]) => {
        // eslint-disable-next-line no-console
        console.info(formatMessage('info', message), ...meta);
    },
    http: (message: string, ...meta: unknown[]) => {
        // eslint-disable-next-line no-console
        console.log(formatMessage('http', message), ...meta);
    },
    verbose: (message: string, ...meta: unknown[]) => {
        // eslint-disable-next-line no-console
        console.log(formatMessage('verbose', message), ...meta);
    },
    debug: (message: string, ...meta: unknown[]) => {
        // eslint-disable-next-line no-console
        console.debug(formatMessage('debug', message), ...meta);
    },
    silly: (message: string, ...meta: unknown[]) => {
        // eslint-disable-next-line no-console
        console.log(formatMessage('silly', message), ...meta);
    },
    log: (level: string, message: string, ...meta: unknown[]) => {
        // eslint-disable-next-line no-console
        console.log(formatMessage(level, message), ...meta);
    },
};

export default logger;
