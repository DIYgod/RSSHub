import type { MiddlewareHandler } from 'hono';
import { config } from '@/config';
import md5 from '@/utils/md5';
import RejectError from '@/errors/types/reject';

const reject = () => {
    throw new RejectError('Authentication failed. Access denied.');
};

const middleware: MiddlewareHandler = async (ctx, next) => {
    const requestPath = ctx.req.path;
    const accessKey = ctx.req.query('key');
    const accessCode = ctx.req.query('code');

    if (requestPath === '/' || requestPath === '/robots.txt' || requestPath === '/favicon.ico' || requestPath === '/logo.png') {
        await next();
    } else {
        if (config.accessKey && !(config.accessKey === accessKey || accessCode === md5(requestPath + config.accessKey))) {
            return reject();
        }
        await next();
    }
};

export default middleware;
