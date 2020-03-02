const config = require('@/config').value;
const art = require('art-template');
const path = require('path');
const pidusage = require('pidusage');

let gitHash;
try {
    gitHash = require('git-rev-sync').short();
} catch (e) {
    gitHash = (process.env.HEROKU_SLUG_COMMIT && process.env.HEROKU_SLUG_COMMIT.slice(0, 7)) || 'unknown';
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

    const ips = Object.keys(ctx.debug.ips).sort((a, b) => ctx.debug.ips[b] - ctx.debug.ips[a]);
    const hotIPs = ips.slice(0, 50);
    let hotIPsValue = '';
    hotIPs.forEach((item) => {
        hotIPsValue += `${ctx.debug.ips[item]}  ${item}<br>`;
    });

    let showDebug;
    if (!config.debugInfo || config.debugInfo === 'false') {
        showDebug = false;
    } else {
        showDebug = config.debugInfo === true || config.debugInfo === ctx.query.debug;
    }

    const stats = await pidusage(process.pid);

    ctx.body = art(path.resolve(__dirname, '../views/welcome.art'), {
        showDebug,
        debug: [
            config.nodeName
                ? {
                      name: 'node name',
                      value: config.nodeName,
                  }
                : null,
            {
                name: 'git hash',
                value: gitHash,
            },
            {
                name: 'request amount',
                value: ctx.debug.request,
            },
            {
                name: 'request frequency',
                value: ((ctx.debug.request / (stats.elapsed / 1000)) * 60).toFixed(3) + ' 次/分钟',
            },
            {
                name: 'cache hit ratio',
                value: ctx.debug.request ? (ctx.debug.hitCache / ctx.debug.request).toFixed(3) : 0,
            },
            {
                name: 'memory usage',
                value: stats.memory / 1000000 + ' MB',
            },
            {
                name: 'CPU usage',
                value: stats.cpu + '%',
            },
            {
                name: 'run time',
                value: (stats.elapsed / 3600000).toFixed(2) + ' 小时',
            },
            {
                name: 'hot routes',
                value: hotRoutesValue,
            },
            {
                name: 'hot paths',
                value: hotPathsValue,
            },
            {
                name: 'hot IP',
                value: hotIPsValue,
            },
            {
                name: 'hot error routes',
                value: hotErrorRoutesValue,
            },
            {
                name: 'hot error paths',
                value: hotErrorPathsValue,
            },
        ],
    });
};
