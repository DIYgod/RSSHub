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
        if (err.status === 401) {
            logger.error('Authentication error: ' + (err instanceof Error ? err.stack : err));
            ctx.set('WWW-Authenticate', 'Basic');
            ctx.body = 'RSSHub: Unauthenticated access.';
            ctx.status = 401;
            if (config.sentry) {
                Raven.captureException(
                    err,
                    {
                        req: ctx.req,
                    },
                    function(err, eventId) {
                        console.log('Authentication error ' + eventId);
                    }
                );
            }
        }
    }
};
