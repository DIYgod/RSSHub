import './utils/request-wrapper.js';

import Koa from 'koa'
import logger from './utils/logger.js'

import onerror from './middleware/onerror.js'
import header from './middleware/header.js'
import utf8  from './middleware/utf8.js';
import cache from './middleware/cache/index.js';
import parameter from './middleware/parameter.js';
import template from './middleware/template.js';
import favicon from 'koa-favicon';
import debug from './middleware/debug.js';
import accessControl from './middleware/access-control.js';
import antiHotlink from './middleware/anti-hotlink.js';
import loadOnDemand from './middleware/load-on-demand.js';

import router from './router.js';
import core_router from './core_router.js';
import protected_router from './protected_router.js';
import mount from 'koa-mount';

// API related
import apiTemplate from './middleware/api-template.js';
import api_router from './api_router.js';
import apiResponseHandler from './middleware/api-response-handler.js';

import { __dirname } from '~/utils/dirname.js'

process.on('uncaughtException', (e) => {
    console.log(e);
    logger.error('uncaughtException: ' + e);
});

const app = new Koa();
app.proxy = true;

// favicon
app.use(favicon(__dirname(import.meta.url) + '/favicon.png'));

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


export default app
