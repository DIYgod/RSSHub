const Router = require('@koa/router');
const config = require('@/config').value;
const router = new Router();

// Load Core Route
router.get('/', require('./routes/index'));

router.get('/robots.txt', (ctx) => {
    if (config.disallowRobot) {
        ctx.set('Content-Type', 'text/plain');
        ctx.body = 'User-agent: *\nDisallow: /';
    } else {
        ctx.throw(404, 'Not Found');
    }
});

module.exports = router;
