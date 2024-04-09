const { resolve } = require('path');
const winston = require('winston');
const config = require('@/config').value;

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

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (!config.isPackage) {
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

module.exports = logger;
