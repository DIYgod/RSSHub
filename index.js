const Koa = require('koa');
const cache = require('koa-redis-cache');

const logger = require('./utils/logger');
const config = require('./config');

const onerror = require('./middleware/onerror');
const header = require('./middleware/header.js');

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

// cache
app.use(cache({
    expire: config.cacheExpire,
    onerror: (e) => {
        logger.error('cache error', e);
    }
}));

// router
app.use(router.routes()).use(router.allowedMethods());

app.listen(config.port);