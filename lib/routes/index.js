const config = require('@/config').value;
const art = require('art-template');
const path = require('path');
const pidusage = require('pidusage');

let gitHash;
try {
    gitHash = require('git-rev-sync').short();
} catch (e) {
    gitHash = (process.env.HEROKU_SLUG_COMMIT && process.env.HEROKU_SLUG_COMMIT.slice(0, 7)) || (process.env.VERCEL_GITHUB_COMMIT_SHA && process.env.VERCEL_GITHUB_COMMIT_SHA.slice(0, 7)) || 'unknown';
}

module.exports = async (ctx) => {
    ctx.set({
        'Content-Type': 'text/html; charset=UTF-8',
        'Cache-Control': 'no-cache',
    });

    const routes = Object.keys(ctx.debug.routes).sort((a, b) => ctx.debug.routes[b] - ctx.debug.routes[a]);
    const hotRoutes = routes.slice(0, 30);
    let hotRoutesValue = '';
    hotRoutes.forEach((item) => {
        hotRoutesValue += `${ctx.debug.routes[item]}  ${item}<br>`;
    });

    const paths = Object.keys(ctx.debug.paths).sort((a, b) => ctx.debug.paths[b] - ctx.debug.paths[a]);
    const hotPaths = paths.slice(0, 30);
    let hotPathsValue = '';
    hotPaths.forEach((item) => {
        hotPathsValue += `${ctx.debug.paths[item]}  ${item}<br>`;
    });

    let hotErrorRoutesValue = '';
    if (ctx.debug.errorRoutes) {
        const errorRoutes = Object.keys(ctx.debug.errorRoutes).sort((a, b) => ctx.debug.errorRoutes[b] - ctx.debug.errorRoutes[a]);
        const hotErrorRoutes = errorRoutes.slice(0, 30);
        hotErrorRoutes.forEach((item) => {
            hotErrorRoutesValue += `${ctx.debug.errorRoutes[item]}  ${item}<br>`;
        });
    }

    let hotErrorPathsValue = '';
    if (ctx.debug.errorPaths) {
        const errorPaths = Object.keys(ctx.debug.errorPaths).sort((a, b) => ctx.debug.errorPaths[b] - ctx.debug.errorPaths[a]);
        const hotErrorPaths = errorPaths.slice(0, 30);
        hotErrorPaths.forEach((item) => {
            hotErrorPathsValue += `${ctx.debug.errorPaths[item]}  ${item}<br>`;
        });
    }

    let showDebug;
    if (!config.debugInfo || config.debugInfo === 'false') {
        showDebug = false;
    } else {
        showDebug = config.debugInfo === 'true' || config.debugInfo === ctx.query.debug;
    }
    const { disallowRobot } = config;

    const stats = await pidusage(process.pid, {
        usePs: true,
    });

    ctx.body = art(path.resolve(__dirname, '../views/welcome.art'), {
        showDebug,
        disallowRobot,
        debug: [
            config.nodeName
                ? {
                      name: 'Node Name',
                      value: config.nodeName,
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
                value: ((ctx.debug.request / (stats.elapsed / 1000)) * 60).toFixed(3) + ' times/minute',
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
                name: 'Memory Usage',
                value: stats.memory / 1000000 + ' MB',
            },
            {
                name: 'CPU Usage',
                value: stats.cpu + '%',
            },
            {
                name: 'Run Time',
                value: (stats.elapsed / 3600000).toFixed(2) + ' hour(s)',
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
