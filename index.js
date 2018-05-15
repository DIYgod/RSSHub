const Koa = require('koa');

const logger = require('./utils/logger');
const config = require('./config');

const onerror = require('./middleware/onerror');
const header = require('./middleware/header.js');
const utf8 = require('./middleware/utf8');
const memoryCache = require('./middleware/lru-cache.js');
const redisCache = require('./middleware/redis-cache.js');
const filter = require('./middleware/filter.js');
const template = require('./middleware/template.js');
const favicon = require('koa-favicon');

const router = require('./router');

process.on('uncaughtException', (e) => {
    logger.error('uncaughtException: ' + e);
});

logger.info('🍻 RSSHub start! Cheers!');

const app = new Koa();

// favicon
app.use(favicon(__dirname + '/favicon.png'));

// global error handing
app.use(onerror);

// set header
app.use(header);

// fix incorrect `utf-8` characters
app.use(utf8);

// generate body
app.use(template);

// filter content
app.use(filter);

// cache
if (config.cacheType === 'memory') {
    app.use(
        memoryCache({
            expire: config.cacheExpire,
            ignoreQuery: true,
        })
    );
} else if (config.cacheType === 'redis') {
    app.use(
        redisCache({
            expire: config.cacheExpire,
            ignoreQuery: true,
            onerror: (e) => {
                logger.error('Redis error: ', e);
            },
            onconnect: () => {
                logger.info('Redis connect.');
            }
        })
    );
}

// router
app.use(router.routes()).use(router.allowedMethods());

app.listen(config.port);
