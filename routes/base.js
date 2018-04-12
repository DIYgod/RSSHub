const logger = require('../utils/logger');
const redis = require('../utils/redis');
const mix = require('../utils/mix');

module.exports = (options) => {
    logger.info(`${options.req.url}, user IP: ${mix.getIp(options.req)}`);

    redis.get(options.req.url, (reply) => {
        if (reply) {
            options.res.send(reply);
        }
        else {
            try {
                options.getHTML((html) => {
                    redis.set(options.req.url, html);
                    options.res.send(html);
                });
            }
            catch (e) {
                redis.set(options.req.url, '');
                options.res.send('');
            }
        }
    });
};