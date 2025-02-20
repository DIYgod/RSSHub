const path = require('path');
const winston = require('winston');
const config = require('@/config').value;

let transports = [];
// Only add file transports if we're not in Vercel and noLogfiles is false
if (!process.env.VERCEL && !config.noLogfiles) {
    try {
        transports = [
            new winston.transports.File({
                filename: path.resolve('logs/error.log'),
                level: 'error',
            }),
            new winston.transports.File({
                filename: path.resolve('logs/combined.log'),
            }),
        ];
    } catch {
        // Initialize with empty transports array if file transport fails
        transports = [];
    }
}

const logger = winston.createLogger({
    level: config.loggerLevel,
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
        winston.format.printf((info) =>
            JSON.stringify({
                timestamp: info.timestamp,
                level: info.level,
                message: info.message,
            })
        )
    ),
    transports,
});

// Add console transport if we're not in package mode or if we're in Vercel
if (!config.isPackage || process.env.VERCEL) {
    logger.add(
        new winston.transports.Console({
            format: winston.format.printf((info) => {
                const infoLevel = winston.format.colorize().colorize(info.level, config.showLoggerTimestamp ? `[${info.timestamp}] ${info.level}` : info.level);
                return `${infoLevel}: ${info.message}`;
            }),
            silent: process.env.NODE_ENV === 'test',
        })
    );
}

// Handle uncaught exceptions in Vercel environment
if (process.env.VERCEL) {
    logger.exceptions.handle(
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.printf((info) => {
                    const timestamp = config.showLoggerTimestamp ? `[${info.timestamp}] ` : '';
                    return `${timestamp}${info.level}: ${info.message}`;
                })
            ),
        })
    );
}

module.exports = logger;
