import { Context } from 'hono';
import { Ipware } from '@fullerstack/nax-ipware';

const ipware = new Ipware();

export const getRouteNameFromPath = (path: string) => {
    const p = path.split('/').filter(Boolean);
    if (p.length > 0) {
        return p[0];
    }
    return null;
};

export const getIp = (ctx: Context) => ipware.getClientIP(ctx.req.raw)?.ip;
