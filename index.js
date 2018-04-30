const Koa = require('koa');

const logger = require('./utils/logger');
const config = require('./config');

const onerror = require('./middleware/onerror');
const header = require('./middleware/header.js');
const utf8 = require('./middleware/utf8');
const memoryCache = require('./middleware/cache.js');
const redisCache = require('koa-redis-cache');

const router = require('./router');

process.on('uncaughtException', (e) => {
    logger.error('uncaughtException: ' + e);
});

logger.info('🍻 RSSHub start! Cheers!');

const app = new Koa();

// global error handing
app.use(onerror);

// set header
app.use(header);

// fix incorrect `utf-8` characters
app.use(utf8);

// cache
if (config.cacheType === 'memory') {
    app.use(
        memoryCache({
            expire: config.cacheExpire
        })
    );
} else if (config.cacheType === 'redis') {
    app.use(
        redisCache({
            expire: config.cacheExpire,
            onerror: (e) => {
                logger.error('cache error', e);
            }
        })
    );
}

// router
app.use(router.routes()).use(router.allowedMethods());

app.listen(config.port);
