import type { MiddlewareHandler } from 'hono';

import { config } from '@/config';
import RejectError from '@/errors/types/reject';
import { consumeWeiboOAuthState, hasValidAccessCredential } from '@/utils/weibo-oauth';

const reject = (requestPath) => {
    throw new RejectError(`Authentication failed. Access denied.\n${requestPath}`);
};

const middleware: MiddlewareHandler = async (ctx, next) => {
    const requestPath = new URL(ctx.req.url).pathname;

    if (['/', '/robots.txt', '/favicon.ico', '/logo.png'].includes(requestPath)) {
        await next();
    } else {
        if (config.accessKey && !hasValidAccessCredential(ctx) && requestPath === '/weibo/timeline/0' && ctx.req.query('code')) {
            const state = await consumeWeiboOAuthState(ctx.req.query('state'));
            if (!state) {
                return reject(requestPath);
            }
            ctx.set('weiboOAuthState', state);
        } else if (!hasValidAccessCredential(ctx)) {
            return reject(requestPath);
        }
        await next();
    }
};

export default middleware;
