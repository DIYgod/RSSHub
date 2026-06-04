import type { Handler } from 'hono';

const handler: Handler = (ctx) => {
    ctx.header('Cache-Control', 'no-cache');
    return ctx.text('ok');
};

export default handler;
