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

    const isControlled = config.accessKey || config.allowlist || config.denylist;

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
            return grant();
        }

        if (config.accessKey) {
            if (config.accessKey === accessKey || accessCode === md5(requestPath + config.accessKey)) {
                return grant();
            }
        }

        if (config.allowlist) {
            if (config.allowlist.find((item) => ip.includes(item) || requestPath.includes(item) || requestUA.includes(item))) {
                return grant();
            }
        }

        if (config.denylist) {
            if (!config.denylist.find((item) => ip.includes(item) || requestPath.includes(item) || requestUA.includes(item))) {
                return grant();
            }
        }

        reject(ctx);
    }
};
