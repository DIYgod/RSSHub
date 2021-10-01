import { resolve } from 'path';
import winston from 'winston';
import { get as getConfig } from '@/config/index.js';
const config = getConfig();

let transports = [];
if (!config.noLogfiles) {
    transports = [
        new winston.transports.File({
            filename: resolve('logs/error.log'),
            level: 'error',
        }),
        new winston.transports.File({ filename: resolve('logs/combined.log') }),
    ];
}
const logger = winston.createLogger({
    level: config.loggerLevel,
    format: winston.format.json(),
    transports,
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (!config.isPackage) {
    logger.add(
        new winston.transports.Console({
            format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
            silent: process.env.NODE_ENV === 'test',
        })
    );
}

export default logger;
