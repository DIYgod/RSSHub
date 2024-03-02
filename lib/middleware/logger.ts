import { MiddlewareHandler } from 'hono';
import logger from '@/utils/logger';
import { getPath, time } from '@/utils/helpers';

enum LogPrefix {
    Outgoing = '-->',
    Incoming = '<--',
    Error = 'xxx',
}

const colorStatus = (status: number) => {
    const out: { [key: string]: string } = {
        7: `\u001B[35m${status}\u001B[0m`,
        5: `\u001B[31m${status}\u001B[0m`,
        4: `\u001B[33m${status}\u001B[0m`,
        3: `\u001B[36m${status}\u001B[0m`,
        2: `\u001B[32m${status}\u001B[0m`,
        1: `\u001B[32m${status}\u001B[0m`,
        0: `\u001B[33m${status}\u001B[0m`,
    };

    const calculateStatus = Math.trunc(status / 100);

    return out[calculateStatus];
};

const middleware: MiddlewareHandler = async (ctx, next) => {
    const { method, raw } = ctx.req;
    const path = getPath(raw);

    logger.info(`${LogPrefix.Incoming} ${method} ${path}`);

    const start = Date.now();

    await next();

    logger.info(`${LogPrefix.Outgoing} ${method} ${path} ${colorStatus(ctx.res.status)} ${time(start)}`);
};

export default middleware;
