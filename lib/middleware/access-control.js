const config = require('@/config').value;
const md5 = require('@/utils/md5');
const isLocalhost = require('is-localhost-ip');

const reject = (ctx) => {
    ctx.response.status = 403;

    throw new Error('Authentication failed. Access denied.');
};

const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
const cidrPattern = /((?:\d{1,3}\.){3}\d{1,3})\/(\d{1,2})/;

const ipInCidr = (cidr, ip) => {
    const cidrMatch = cidr.match(cidrPattern);
    const ipMatch = ip.match(ipv4Pattern);
    if (!cidrMatch || !ipMatch) {
        return false;
    }
    const subnetMask = Number.parseInt(cidrMatch[2]);
    const cidrIpBits = ipv4ToBitsring(cidrMatch[1]).substring(0, subnetMask);
    const ipBits = ipv4ToBitsring(ip).substring(0, subnetMask);
    return cidrIpBits === ipBits;
};

const ipv4ToBitsring = (ip) =>
    ip
        .split('.')
        .map((part) => ('00000000' + Number.parseInt(part).toString(2)).slice(-8))
        .join('');

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

        if (config.accessKey && (config.accessKey === accessKey || accessCode === md5(requestPath + config.accessKey))) {
            return grant();
        }

        if (config.allowlist && config.allowlist.some((item) => ip.includes(item) || ipInCidr(item, ip) || requestPath.includes(item) || requestUA.includes(item))) {
            return grant();
        }

        if (config.denylist && !config.denylist.some((item) => ip.includes(item) || ipInCidr(item, ip) || requestPath.includes(item) || requestUA.includes(item))) {
            return grant();
        }

        reject(ctx);
    }
};
