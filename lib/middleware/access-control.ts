import type { MiddlewareHandler } from 'hono';
import { config } from '@/config';
import md5 from '@/utils/md5';
import ipUtils from 'ip';
import { getIp } from '@/utils/helpers';
import RejectError from '@/errors/reject';

const reject = () => {
    throw new RejectError('Authentication failed. Access denied.');
};

const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
const cidrPattern = /((?:\d{1,3}\.){3}\d{1,3})\/(\d{1,2})/;

const ipInCidr = (cidr: string, ip: string) => {
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

const ipv4ToBitsring = (ip: string) =>
    ip
        .split('.')
        .map((part) => ('00000000' + Number.parseInt(part).toString(2)).slice(-8))
        .join('');

const middleware: MiddlewareHandler = async (ctx, next) => {
    const ip = getIp(ctx);
    const requestPath = ctx.req.path;
    const requestUA = ctx.req.header('user-agent');
    const accessKey = ctx.req.query('key');
    const accessCode = ctx.req.query('code');

    const isControlled = config.accessKey || config.allowlist || config.denylist;

    const allowLocalhost = config.allowLocalhost && ip && ipUtils.isPrivate(ip);

    const grant = async () => {
        if (ctx.res.status !== 403) {
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

        if (config.allowlist && config.allowlist.some((item) => ip?.includes(item) || (ip && ipInCidr(item, ip)) || requestPath.includes(item) || requestUA?.includes(item))) {
            return grant();
        }

        if (config.denylist && !config.denylist.some((item) => ip?.includes(item) || (ip && ipInCidr(item, ip)) || requestPath.includes(item) || requestUA?.includes(item))) {
            return grant();
        }

        reject();
    }
};

export default middleware;
