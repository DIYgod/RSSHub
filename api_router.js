const Router = require('koa-router');
const router = new Router();
const routes = require('./router');

router.get('/routes/:name?', (ctx) => {
    const allRoutes = Array.from(routes.stack);
    allRoutes.shift();
    const result = {};

    allRoutes.forEach((i) => {
        const path = i.path;
        const top = path.split('/')[1];

        if (ctx.params.name === undefined) {
            if (result[top]) {
                result[top].routes.push(path);
            } else {
                result[top] = { routes: [path] };
            }
        } else {
            if (top === ctx.params.name) {
                if (result[top]) {
                    result[top].routes.push(path);
                } else {
                    result[top] = { routes: [path] };
                }
            }
        }
    });

    ctx.body = result;
});

module.exports = router;
