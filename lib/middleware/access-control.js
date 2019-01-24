const art = require('art-template');
const path = require('path');
const config = require('../config');

const reject = (ctx) => {
    ctx.response.status = 403;
    ctx.body = art(path.resolve(__dirname, '../views/rss.art'), {
        lastBuildDate: new Date().toUTCString(),
        updated: new Date().toISOString(),
        ttl: 24 * 60 * 60,
        title: '没有访问权限. Access denied.',
        link: 'https://docs.rsshub.app/install/#%E8%AE%BF%E9%97%AE%E6%8E%A7%E5%88%B6',
    });
};

module.exports = async (ctx, next) => {
    const ip = ctx.ips[0] || ctx.ip;
    const requestPath = ctx.request.path;

    if (requestPath === '/') {
        await next();
    } else {
        if (config.whitelist) {
            if (!(config.whitelist.indexOf(ip) !== -1 || config.whitelist.indexOf(requestPath) !== -1)) {
                reject(ctx);
            }
        } else {
            if (config.blacklist) {
                if (config.blacklist.indexOf(ip) !== -1 || config.blacklist.indexOf(requestPath) !== -1) {
                    reject(ctx);
                }
            }
        }

        if (ctx.response.status !== 403) {
            await next();
        }
    }
};
