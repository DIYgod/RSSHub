const config = require('@/config').value;

const reject = (ctx) => {
    ctx.response.status = 403;

    throw Error('Access denied.');
};

module.exports = async (ctx, next) => {
    const ip = ctx.ips[0] || ctx.ip;
    const requestPath = ctx.request.path;

    if (requestPath === '/') {
        await next();
    } else {
        if (config.whitelist) {
            if (!(config.whitelist.includes(ip) || config.whitelist.includes(requestPath))) {
                reject(ctx);
            }
        } else {
            if (config.blacklist) {
                if (config.blacklist.includes(ip) || config.blacklist.includes(requestPath)) {
                    reject(ctx);
                }
            }
        }

        if (ctx.response.status !== 403) {
            await next();
        }
    }
};
