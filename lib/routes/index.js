const config = require('@/config').value;
const art = require('art-template');
const path = require('path');

let gitHash;
try {
    gitHash = require('git-rev-sync').short();
} catch {
    gitHash = (process.env.HEROKU_SLUG_COMMIT && process.env.HEROKU_SLUG_COMMIT.slice(0, 7)) || (process.env.VERCEL_GIT_COMMIT_SHA && process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7)) || 'unknown';
}

const startTime = Date.now();

module.exports = (ctx) => {
    ctx.set({
        'Content-Type': 'text/html; charset=UTF-8',
        'Cache-Control': 'no-cache',
    });

    const routes = Object.keys(ctx.debug.routes).sort((a, b) => ctx.debug.routes[b] - ctx.debug.routes[a]);
    const hotRoutes = routes.slice(0, 30);
    const hotRoutesValue = hotRoutes.map((item) => `${ctx.debug.routes[item]}  ${item}<br>`).join('');

    const paths = Object.keys(ctx.debug.paths).sort((a, b) => ctx.debug.paths[b] - ctx.debug.paths[a]);
    const hotPaths = paths.slice(0, 30);

    const hotPathsValue = hotPaths.map((item) => `${ctx.debug.paths[item]}  ${item}<br>`).join('');

    let hotErrorRoutesValue = '';
    if (ctx.debug.errorRoutes) {
        const errorRoutes = Object.keys(ctx.debug.errorRoutes).sort((a, b) => ctx.debug.errorRoutes[b] - ctx.debug.errorRoutes[a]);
        const hotErrorRoutes = errorRoutes.slice(0, 30);
        hotErrorRoutesValue = hotErrorRoutes.map((item) => `${ctx.debug.errorRoutes[item]}  ${item}<br>`).join('');
    }

    let hotErrorPathsValue = '';
    if (ctx.debug.errorPaths) {
        const errorPaths = Object.keys(ctx.debug.errorPaths).sort((a, b) => ctx.debug.errorPaths[b] - ctx.debug.errorPaths[a]);
        const hotErrorPaths = errorPaths.slice(0, 30);
        hotErrorPathsValue = hotErrorPaths.map((item) => `${ctx.debug.errorPaths[item]}  ${item}<br>`).join('');
    }

    const showDebug = !config.debugInfo || config.debugInfo === 'false' ? false : config.debugInfo === 'true' || config.debugInfo === ctx.query.debug;
    const { disallowRobot, nodeName } = config;

    const duration = Date.now() - startTime;

    ctx.body = art(path.resolve(__dirname, '../views/welcome.art'), {
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
                value: ctx.debug.request,
            },
            {
                name: 'Request Frequency',
                value: ((ctx.debug.request / (duration / 1000)) * 60).toFixed(3) + ' times/minute',
            },
            {
                name: 'Cache Hit Ratio',
                value: ctx.debug.request ? (ctx.debug.hitCache / ctx.debug.request).toFixed(3) : 0,
            },
            {
                name: 'ETag Matched',
                value: ctx.debug.etag,
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
    });
};
