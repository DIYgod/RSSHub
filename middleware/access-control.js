const art = require('art-template');
const path = require('path');
const blacklist = process.env.BLACKLIST && process.env.BLACKLIST.split(',');
const whitelist = process.env.WHITELIST && process.env.WHITELIST.split(',');

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
        if (whitelist) {
            if (!(whitelist.indexOf(ip) !== -1 || whitelist.indexOf(requestPath) !== -1)) {
                reject(ctx);
            }
        } else {
            if (blacklist) {
                if (blacklist.indexOf(ip) !== -1 || blacklist.indexOf(requestPath) !== -1) {
                    reject(ctx);
                }
            }
        }

        if (ctx.response.status !== 403) {
            await next();
        }
    }
};
