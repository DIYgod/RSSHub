import type { Handler } from 'hono';
import { config } from '@/config';
import art from 'art-template';
import * as path from 'node:path';
import gitRevSync from 'git-rev-sync';
import { getDebugInfo } from '@/middleware/debug';

let gitHash = process.env.HEROKU_SLUG_COMMIT?.slice(0, 7) || process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7)
if (!gitHash) {
    try {
        gitHash = gitRevSync.short();
    } catch {
        gitHash = 'unknown';
    }
}

const startTime = Date.now();

const handler: Handler = (ctx) => {
    ctx.header('Content-Type', 'text/html; charset=UTF-8')
    ctx.header('Cache-Control', 'no-cache')

    const debug = getDebugInfo();
    const routes = Object.keys(debug.routes).sort((a, b) => debug.routes[b] - debug.routes[a]);
    const hotRoutes = routes.slice(0, 30);
    const hotRoutesValue = hotRoutes.map((item) => `${debug.routes[item]}  ${item}<br>`).join('');

    const paths = Object.keys(debug.paths).sort((a, b) => debug.paths[b] - debug.paths[a]);
    const hotPaths = paths.slice(0, 30);

    const hotPathsValue = hotPaths.map((item) => `${debug.paths[item]}  ${item}<br>`).join('');

    let hotErrorRoutesValue = '';
    if (debug.errorRoutes) {
        const errorRoutes = Object.keys(debug.errorRoutes).sort((a, b) => debug.errorRoutes[b] - debug.errorRoutes[a]);
        const hotErrorRoutes = errorRoutes.slice(0, 30);
        hotErrorRoutesValue = hotErrorRoutes.map((item) => `${debug.errorRoutes[item]}  ${item}<br>`).join('');
    }

    let hotErrorPathsValue = '';
    if (debug.errorPaths) {
        const errorPaths = Object.keys(debug.errorPaths).sort((a, b) => debug.errorPaths[b] - debug.errorPaths[a]);
        const hotErrorPaths = errorPaths.slice(0, 30);
        hotErrorPathsValue = hotErrorPaths.map((item) => `${debug.errorPaths[item]}  ${item}<br>`).join('');
    }

    const showDebug = !config.debugInfo || config.debugInfo === 'false' ? false : config.debugInfo === 'true' || config.debugInfo === ctx.req.query('debug');
    const { disallowRobot, nodeName } = config;

    const duration = Date.now() - startTime;

    return ctx.body(art(path.resolve(__dirname, '../views/welcome.art'), {
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
            {
                name: 'Hot Routes',
                value: hotRoutesValue,
            },
            {
                name: 'Hot Paths',
                value: hotPathsValue,
            },
            {
                name: 'Hot Error Routes',
                value: hotErrorRoutesValue,
            },
            {
                name: 'Hot Error Paths',
                value: hotErrorPathsValue,
            },
        ],
    }));
};

export default handler;
