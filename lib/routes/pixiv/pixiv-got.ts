import tls from 'node:tls';

import ipRegex from 'ip-regex';

import { config } from '@/config';
import got from '@/utils/got';
import logger from '@/utils/logger';

async function dohResolve(name, jsonDohEndpoint) {
    try {
        const response = await got(jsonDohEndpoint, {
            searchParams: {
                name,
                type: 'A',
            },
            headers: {
                accept: 'application/dns-json',
            },
        });
        if (response.data.Status === 0) {
            return response.data.Answer.map((item) => item.data);
        } else {
            logger.error(`Error ${response.data.Status} when querying DoH endpoint ${jsonDohEndpoint}`);
        }
    } catch (error) {
        logger.error(`Failed to resolve ${name}`);
        logger.debug(error);
    }
    return [];
}

const pixivGot = got.extend({
    hooks: {
        beforeRequest: [
            async (options) => {
                if (!config.pixiv.bypassCdn) {
                    return;
                }
                let hostname = null;
                const isIP = ipRegex({ exact: true }).test(config.pixiv.bypassCdnHostname);
                if (isIP) {
                    hostname = config.pixiv.bypassCdnHostname;
                } else {
                    const addresses = await dohResolve(config.pixiv.bypassCdnHostname, config.pixiv.bypassCdnDoh);
                    if (addresses.length) {
                        hostname = addresses[Math.floor(addresses.length * Math.random())];
                    } else {
                        logger.warn(`No IPv4 address resolved from ${config.pixiv.bypassCdnHostname}`);
                    }
                }
                if (hostname) {
                    const actualHost = options.url.host;
                    options.headers = {
                        ...options.headers,
                        host: actualHost,
                    };
                    options.url.hostname = hostname;
                    options.checkServerIdentity = function (host, certificate) {
                        return tls.checkServerIdentity(actualHost, certificate);
                    };
                }
            },
        ],
    },
});

export default pixivGot;
