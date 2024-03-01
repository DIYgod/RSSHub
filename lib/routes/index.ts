import type { Handler } from 'hono';
import { config } from '@/config';
import art from 'art-template';
import * as path from 'node:path';
import gitHash from '@/utils/git-hash';
import { getDebugInfo } from '@/utils/debug-info';

const startTime = Date.now();

const handler: Handler = (ctx) => {
    ctx.header('Cache-Control', 'no-cache');

    const debug = getDebugInfo();

    const showDebug = !config.debugInfo || config.debugInfo === 'false' ? false : config.debugInfo === 'true' || config.debugInfo === ctx.req.query('debug');
    const { disallowRobot, nodeName } = config;

    const duration = Date.now() - startTime;

    return ctx.html(
        art(path.resolve(__dirname, '../views/welcome.art'), {
            showDebug,
            disallowRobot,
            debug: [
                nodeName
                    ? {
                          name: 'Node Name',
                          value: nodeName,
                      }
                    : null,
                {
                    name: 'Git Hash',
                    value: gitHash,
                },
                {
                    name: 'Request Amount',
                    value: debug.request,
                },
                {
                    name: 'Request Frequency',
                    value: ((debug.request / (duration / 1000)) * 60).toFixed(3) + ' times/minute',
                },
                {
                    name: 'Cache Hit Ratio',
                    value: debug.request ? (debug.hitCache / debug.request).toFixed(3) : 0,
                },
                {
                    name: 'ETag Matched',
                    value: debug.etag,
                },
                {
                    name: 'Run Time',
                    value: (duration / 3_600_000).toFixed(2) + ' hour(s)',
                },
            ],
        })
    );
};

export default handler;
