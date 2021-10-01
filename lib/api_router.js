import Router from '@koa/router';
const router = new Router();
import maintainer from './maintainer.js';

router.get('/routes/:name?', (ctx) => {
    const result = {};
    let counter = 0;

    Object.keys(maintainer).forEach((i) => {
        const path = i;
        const top = path.split('/')[1];

        if (!ctx.params.name || top === ctx.params.name) {
            if (result[top]) {
                result[top].routes.push(path);
            } else {
                result[top] = { routes: [path] };
            }
            counter++;
        }
    });

    ctx.body = { counter, result };
});

export default router;
