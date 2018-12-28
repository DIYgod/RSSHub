const logger = require('../utils/logger');
const Raven = require('raven');
const config = require('../config');

if (config.sentry) {
    Raven.config(config.sentry).install();
}

module.exports = async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        logger.error(`Error in ${ctx.request.path}: ${err instanceof Error ? err.stack : err}`);
        ctx.set({
            'Content-Type': 'text/html; charset=UTF-8',
        });
        ctx.body = `RSSHub 发生了一些意外: <pre>${err instanceof Error ? err.stack : err}</pre>`;
        if (err.status === 401) {
            ctx.status = 401;
        } else {
            ctx.status = 404;
        }

        if (config.sentry) {
            Raven.captureException(
                err,
                {
                    req: ctx.req,
                },
                function(err, eventId) {
                    console.log('Reported error ' + eventId);
                }
            );
        }
    }
};
