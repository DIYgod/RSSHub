const art = require('art-template');
const path = require('path');

module.exports = async (ctx, next) => {
    const blacklist = (process.env.BLACKLIST && process.env.BLACKLIST.split(',')) || [];
    const whitelist = process.env.WHITELIST && process.env.WHITELIST.split(',');

    const ip = ctx.ips[0] || ctx.ip;
    const requestPath = ctx.request.path;

    const pathAllowed = (whitelist && whitelist.indexOf(requestPath) !== -1) || blacklist.indexOf(requestPath) === -1;
    const ipAllowed = (whitelist && whitelist.indexOf(ip) !== -1) || blacklist.indexOf(ip) === -1;

    if (pathAllowed && ipAllowed) {
        await next();
    } else {
        ctx.response.status = 403;
        ctx.body = art(path.resolve(__dirname, '../views/rss.art'), {
            lastBuildDate: new Date().toUTCString(),
            updated: new Date().toISOString(),
            ttl: 24 * 60 * 60,
            title: `没有访问权限: ${!pathAllowed ? '该路由' : '你的 IP '}已被列为黑名单`,
            link: 'https://docs.rsshub.app/install/#%E8%AE%BF%E9%97%AE%E6%8E%A7%E5%88%B6',
            item: [
                {
                    title: `没有访问权限: ${!pathAllowed ? '该路由' : '你的 IP '}已被列为黑名单`,
                    link: 'https://docs.rsshub.app/install/#%E8%AE%BF%E9%97%AE%E6%8E%A7%E5%88%B6',
                },
            ],
        });
    }
};
