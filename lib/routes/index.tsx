import type { Handler } from 'hono';

import Index from '@/views/index';

const handler: Handler = (ctx) => {
    ctx.header('Cache-Control', 'no-cache');

    return ctx.html(<Index debugQuery={ctx.req.query('debug')} />);
};

export default handler;
