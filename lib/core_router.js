import Router from '@koa/router';
import {config} from '~/config.js';
const router = new Router();

// Load Core Route
router.get('/', (await import('./routes/index.js')).default);

router.get('/robots.txt', (ctx) => {
    if (config.disallowRobot) {
        ctx.set('Content-Type', 'text/plain');
        ctx.body = 'User-agent: *\nDisallow: /';
    } else {
        ctx.throw(404, 'Not Found');
    }
});

export default router;
