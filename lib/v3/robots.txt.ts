import type { Handler } from 'hono';
import { config } from '@/config';

const handler: Handler = (ctx) => {
    if (config.disallowRobot) {
        ctx.header('Content-Type', 'text/plain');
        return ctx.body('User-agent: *\nDisallow: /');
    } else {
        ctx.status(404);
        return ctx.body('');
    }
};

export default handler;
