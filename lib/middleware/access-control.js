const config = require('@/config').value;

const reject = (ctx) => {
    ctx.response.status = 403;

    throw Error('Access denied.');
};

module.exports = async (ctx, next) => {
    const ip = ctx.ips[0] || ctx.ip;
    const requestPath = ctx.request.path;
    const accessKey = ctx.query.key;

    const grant = async () => {
        if (ctx.response.status !== 403) {
            await next();
        }
    };

    if (requestPath === '/') {
        await next();
    } else {
        if (config.accessKey) {
            if (config.accessKey.includes(accessKey)) {
                return await grant();
            }
        }

        if (config.whitelist) {
            if (config.whitelist.includes(ip) || config.whitelist.includes(requestPath)) {
                return await grant();
            }
        }

        if (config.blacklist) {
            if (!(config.blacklist.includes(ip) || config.blacklist.includes(requestPath))) {
                return await grant();
            }
        }

        reject(ctx);
    }
};
