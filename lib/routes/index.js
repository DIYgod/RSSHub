const config = require('@/config');
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
    });

    const routes = Object.keys(ctx.debug.routes).sort((a, b) => ctx.debug.routes[b] - ctx.debug.routes[a]);
    const hotRoutes = routes.slice(0, 30);
    let hotRoutesValue = '';
    hotRoutes.forEach((item) => {
        hotRoutesValue += `${ctx.debug.routes[item]}&nbsp;&nbsp;${item}<br>`;
    });

    const paths = Object.keys(ctx.debug.paths).sort((a, b) => ctx.debug.paths[b] - ctx.debug.paths[a]);
    const hotPaths = paths.slice(0, 30);
    let hotPathsValue = '';
    hotPaths.forEach((item) => {
        hotPathsValue += `${ctx.debug.paths[item]}&nbsp;&nbsp;${item}<br>`;
    });

    const ips = Object.keys(ctx.debug.ips).sort((a, b) => ctx.debug.ips[b] - ctx.debug.ips[a]);
    const hotIPs = ips.slice(0, 50);
    let hotIPsValue = '';
    hotIPs.forEach((item) => {
        hotIPsValue += `${ctx.debug.ips[item]}&nbsp;&nbsp;${item}<br>`;
    });

    let showDebug;
    if (!config.debugInfo || config.debugInfo === 'false') {
        showDebug = false;
    } else {
        showDebug = config.debugInfo === true || config.debugInfo === ctx.query.debug;
    }

    const stats = await pidusage(process.pid);

    ctx.set({
        'Cache-Control': 'no-cache',
    });
    ctx.body = art(path.resolve(__dirname, '../views/welcome.art'), {
        showDebug,
        debug: [
            {
                name: 'git hash',
                value: gitHash,
            },
            {
                name: '请求数',
                value: ctx.debug.request,
            },
            {
                name: '请求频率',
                value: ((ctx.debug.request / (stats.elapsed / 1000)) * 60).toFixed(3) + ' 次/分钟',
            },
            {
                name: '缓存命中率',
                value: ctx.debug.request ? (ctx.debug.hitCache / ctx.debug.request).toFixed(3) : 0,
            },
            {
                name: '内存占用',
                value: stats.memory / 1000000 + ' MB',
            },
            {
                name: 'CPU 占用',
                value: stats.cpu + '%',
            },
            {
                name: '运行时间',
                value: (stats.elapsed / 3600000).toFixed(2) + ' 小时',
            },
            {
                name: '热门路由',
                value: hotRoutesValue,
            },
            {
                name: '热门路径',
                value: hotPathsValue,
            },
            {
                name: '热门IP',
                value: hotIPsValue,
            },
        ],
    });
};
