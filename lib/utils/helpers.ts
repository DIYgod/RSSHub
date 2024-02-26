import { Context } from 'hono';
import { Ipware } from '@fullerstack/nax-ipware';
import { config } from '@/config';

const ipware = new Ipware();

export const getRouteNameFromPath = (path: string) => {
    const p = path.split('/').filter(Boolean);
    if (p.length > 0) {
        return p[0];
    }
    return null;
};

export const getIp = (ctx: Context) => (config.nodeName === 'mock' && ctx.req.header('X-Mock-IP') ? ctx.req.header('X-Mock-IP') : ipware.getClientIP(ctx.req.raw)?.ip);
