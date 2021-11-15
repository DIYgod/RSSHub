import Router from '@koa/router';
import { getGlobalConfig } from '~/config/index.js';
import index from './routes/index.js';
const config = getGlobalConfig();
const router = new Router();

// Load Core Route
router.get('/', index);

router.get('/robots.txt', (ctx) => {
    if (config.disallowRobot) {
        ctx.set('Content-Type', 'text/plain');
        ctx.body = 'User-agent: *\nDisallow: /';
    } else {
        ctx.throw(404, 'Not Found');
    }
});

export default router;
