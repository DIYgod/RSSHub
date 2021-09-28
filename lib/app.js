import moduleAlias from 'module-alias';
moduleAlias.addAlias('@', () => __dirname);

import './utils/request-wrapper';

import Koa from 'koa';
import logger from './utils/logger';

import onerror from './middleware/onerror';
import header from './middleware/header';
import utf8 from './middleware/utf8';
import cache from './middleware/cache';
import parameter from './middleware/parameter';
import template from './middleware/template';
import favicon from 'koa-favicon';
import debug from './middleware/debug';
import accessControl from './middleware/access-control';
import antiHotlink from './middleware/anti-hotlink';
import loadOnDemand from './middleware/load-on-demand';

import router from './router';
import core_router from './core_router';
import protected_router from './protected_router';
import mount from 'koa-mount';

// API related
import apiTemplate from './middleware/api-template';
import api_router from './api_router';
import apiResponseHandler from './middleware/api-response-handler';

process.on('uncaughtException', (e) => {
    logger.error('uncaughtException: ' + e);
});

const app = new Koa();
app.proxy = true;

// favicon
app.use(favicon(__dirname + '/favicon.png'));

// global error handing
app.use(onerror);

app.use(accessControl);

// 7 debug
app.context.debug = {
    hitCache: 0,
    request: 0,
    etag: 0,
    paths: [],
    routes: [],
    errorPaths: [],
    errorRoutes: [],
};
app.use(debug);

// 6 set header
app.use(header);

// 5 fix incorrect `utf-8` characters
app.use(utf8);

app.use(apiTemplate);
app.use(apiResponseHandler());

// 4 generate body
app.use(template);
// anti-hotlink
app.use(antiHotlink);

// 3 filter content
app.use(parameter);

// No Cache routes
app.use(mount('/', core_router.routes())).use(core_router.allowedMethods());
// API router
app.use(mount('/api', api_router.routes())).use(api_router.allowedMethods());

// 2 cache
app.use(cache(app));

// 1 load on demand
app.use(loadOnDemand(app));

// router
app.use(mount('/', router.routes())).use(router.allowedMethods());

// routes the require authentication
app.use(mount('/protected', protected_router.routes())).use(protected_router.allowedMethods());

export default app;
