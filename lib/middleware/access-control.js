const config = require('@/config').value;
const md5 = require('@/utils/md5');
const isLocalhost = require('is-localhost-ip');

const reject = (ctx) => {
    ctx.response.status = 403;

    throw Error('Authentication failed. Access denied.');
};

module.exports = async (ctx, next) => {
    const ip = ctx.ips[0] || ctx.ip;
    const requestPath = ctx.request.path;
    const requestUA = ctx.request.header['user-agent'];
    const accessKey = ctx.query.key;
    const accessCode = ctx.query.code;

    const isControlled = config.accessKey || config.whitelist || config.blacklist;

    const allowLocalhost = config.allowLocalhost && (await isLocalhost(ip));

    const grant = async () => {
        if (ctx.response.status !== 403) {
            await next();
        }
    };

    if (requestPath === '/' || requestPath === '/robots.txt') {
        await next();
    } else {
        if (!isControlled || allowLocalhost) {
            return await grant();
        }

        if (config.accessKey) {
            if (config.accessKey === accessKey || accessCode === md5(requestPath + config.accessKey)) {
                return await grant();
            }
        }

        if (config.whitelist) {
            if (config.whitelist.find((white) => ip.includes(white) || requestPath.includes(white) || requestUA.includes(white))) {
                return await grant();
            }
        }

        if (config.blacklist) {
            if (!config.blacklist.find((black) => ip.includes(black) || requestPath.includes(black) || requestUA.includes(black))) {
                return await grant();
            }
        }

        reject(ctx);
    }
};
