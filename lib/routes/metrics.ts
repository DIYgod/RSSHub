import type { Handler } from 'hono';

import { getContext } from '@/utils/otel';

const handler: Handler = async (ctx) => {
    try {
        const val = await getContext();
        return ctx.text(val);
    } catch (error) {
        ctx.status(500);
        ctx.json({ error });
    }
};

export default handler;
